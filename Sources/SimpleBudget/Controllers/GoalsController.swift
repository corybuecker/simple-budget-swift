import Fluent
import Foundation
import Vapor

struct DateValidatorResult: ValidatorResult {
  public let isValid: Bool

  var isFailure: Bool {
    !isValid
  }
  var successDescription: String? = "Date is valid"
  var failureDescription: String? = "Date is invalid"
}

struct DateValidator {
  public static var valid: Validator<String> {
    Validator<String>(validate: { (input) in
      let dataFormatter = ISO8601DateFormatter()
      dataFormatter.formatOptions = [.withFullDate]
      if dataFormatter.date(from: input) != nil {
        return DateValidatorResult(isValid: true)
      }
      return DateValidatorResult(isValid: false)
    })
  }
}

struct GoalSerializer: Content {
  var id: String
  var name: String
  var amount: String?

  var completeAt: String
  var recurrence: GoalRecurrence
}

struct GoalParams: Content, Validatable {
  static func validations(_ validations: inout Vapor.Validations) {
    validations.add(
      "completeAt", as: String.self, is: DateValidator.valid, required: true,
      customFailureDescription: "completion date is invalid")

    validations.add(
      "amount", as: String.self, is: DecimalValidator.valid, required: true,
      customFailureDescription: "amount is invalid")

    validations.add("name", as: String.self, is: !.empty, required: true)
  }

  var name: String
  var amount: Decimal
  var completeAt: String
  var recurrence: GoalRecurrence
}

struct HTML {
  let value: View
}

extension HTML: AsyncResponseEncodable {
  public func encodeResponse(for request: Request) async throws -> Response {
    var headers = HTTPHeaders()
    headers.add(name: .contentType, value: "text/html")
    return .init(status: .unprocessableEntity, headers: headers, body: .init(buffer: value.data))
  }
}

struct GoalsController: RouteCollection {
  func boot(routes: RoutesBuilder) throws {
    let goals = routes.grouped("goals")
      .grouped(SessionTokenAuthenticator())
      .grouped(SessionToken.redirectMiddleware(path: "/authentication"))

    goals.get(use: index)
    goals.get("new", use: new)
    goals.get(":id", use: edit)
    goals.patch(":id", use: update)
    goals.post(use: create)
    goals.delete(":id", use: delete)
  }

  func index(request: Request) async throws -> View {
    let user = try request.auth.require(SessionToken.self).user
    let goals = try await Goal.query(on: request.db)
      .filter(\Goal.$user.$id == user.requireID())
      .sort(\Goal.$name, .ascending)
      .all()

    let dateFormatter = ISO8601DateFormatter()
    dateFormatter.formatOptions = [.withFullDate]

    let serializedGoals = try goals.map({ (goal) -> GoalSerializer in
      try GoalSerializer(
        id: goal.requireID().uuidString,
        name: goal.name,
        amount: CurrencyService(goal.amount).withoutCents(),
        completeAt: dateFormatter.string(from: goal.completeAt),
        recurrence: goal.recurrence
      )
    })
    return try await request.view.render("goals/index", ["goals": serializedGoals])
  }

  func new(request: Request) async throws -> View {
    return try await request.view.render("goals/new")
  }

  func create(request: Request) async throws -> Response {
    if let errors = try GoalParams.validations().validate(request: request).error?.description {
      return try await HTML(value: request.view.render("goals/new", ["errors": errors]))
        .encodeResponse(for: request)
    }

    let goalParams = try request.content.decode(GoalParams.self)
    let goal = try Goal(request.auth.require(SessionToken.self).user.requireID())

    let dateFormatter = ISO8601DateFormatter()
    dateFormatter.formatOptions = [.withFullDate]

    goal.name = goalParams.name
    goal.amount = goalParams.amount

    if let parsedDate = dateFormatter.date(from: goalParams.completeAt) {
      goal.completeAt = parsedDate
    }

    goal.recurrence = goalParams.recurrence

    try await goal.save(on: request.db)

    return try request.redirect(to: "/goals/\(goal.requireID())")
  }

  func edit(request: Request) async throws -> View {
    guard
      let goal = try await Goal.find(
        request.parameters.get("id", as: UUID.self), on: request.db)
    else {
      throw Abort(.notFound)
    }
    let dateFormatter = ISO8601DateFormatter()
    dateFormatter.formatOptions = [.withFullDate]
    let serializedGoal = try GoalSerializer(
      id: goal.requireID().uuidString,
      name: goal.name,
      amount: goal.amount.description,
      completeAt: dateFormatter.string(from: goal.completeAt),
      recurrence: goal.recurrence
    )
    return try await request.view.render("goals/edit", ["goal": serializedGoal])
  }

  func update(request: Request) async throws -> Response {
    guard
      let goal = try await Goal.find(
        request.parameters.get("id", as: UUID.self), on: request.db)
    else {
      throw Abort(.notFound)
    }

    if let errors = try GoalParams.validations().validate(request: request).error?.description {
      return try await HTML(
        value: request.view.render("goals/edit/\(goal.requireID())", ["errors": errors])
      )
      .encodeResponse(for: request)
    }

    let goalBody = try request.content.decode(GoalParams.self)

    let dataFormatter = ISO8601DateFormatter()
    dataFormatter.formatOptions = [.withFullDate]

    goal.name = goalBody.name
    goal.amount = goalBody.amount
    goal.recurrence = goalBody.recurrence

    if let parsedDate = dataFormatter.date(from: goalBody.completeAt) {
      goal.completeAt = parsedDate
    }

    try await goal.save(on: request.db)

    return request.redirect(to: "/goals")
  }

  func delete(request: Request) async throws -> Response {
    guard
      let goal = try await Goal.find(
        request.parameters.get("id", as: UUID.self), on: request.db)
    else {
      throw Abort(.notFound)
    }
    try await goal.delete(on: request.db)
    return request.redirect(to: "/goals")
  }
}
