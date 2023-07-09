import Fluent
import Vapor

struct GoalBody: Content {
  var name: String
  var amount: Decimal
  var completeAt: Date
  var recurrence: GoalRecurrence
}

enum GoalsControllerErrors: Error {
  case invalidDate
}

struct GoalsController: RouteCollection {
  func boot(routes: RoutesBuilder) throws {
    let goals = routes.grouped("api", "goals").grouped(Authenticator())

    goals.get(use: index)
    goals.get(":id", use: edit)
    goals.patch(":id", use: update)
    goals.post(use: create)
    goals.delete(":id", use: delete)
  }

  func index(request: Request) async throws -> [Goal] {
    try await Goal.query(on: request.db).all()
  }

  func edit(request: Request) async throws -> Goal {
    guard
      let goal = try await Goal.find(
        request.parameters.get("id", as: UUID.self), on: request.db)
    else {
      throw Abort(.notFound)
    }
    return goal
  }

  func update(request: Request) async throws -> Goal {
    guard
      let goal = try await Goal.find(
        request.parameters.get("id", as: UUID.self), on: request.db)
    else {
      throw Abort(.notFound)
    }

    let decoder = JSONDecoder()
    decoder.dateDecodingStrategy = .custom({ decoder in
      let container = try decoder.singleValueContainer()
      let dateStr = try container.decode(String.self)
      let formatter = ISO8601DateFormatter()
      formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
      if let parsedDate = formatter.date(from: dateStr) {
        return parsedDate
      }
      throw GoalsControllerErrors.invalidDate
    })
    let goalBody = try request.content.decode(GoalBody.self, using: decoder)

    goal.name = goalBody.name
    goal.amount = goalBody.amount
    goal.completeAt = goalBody.completeAt
    goal.recurrence = goalBody.recurrence

    try await goal.save(on: request.db)

    return goal
  }

  func create(request: Request) async throws -> Goal {
    request.logger.debug("\(request.content)")

    let decoder = JSONDecoder()
    decoder.dateDecodingStrategy = .custom({ decoder in
      let container = try decoder.singleValueContainer()
      let dateStr = try container.decode(String.self)
      let formatter = ISO8601DateFormatter()
      formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
      if let parsedDate = formatter.date(from: dateStr) {
        return parsedDate
      }
      throw GoalsControllerErrors.invalidDate
    })
    let goalBody = try request.content.decode(GoalBody.self, using: decoder)

    let goal = try Goal(request.auth.get(User.self)?.requireID())
    goal.name = goalBody.name
    goal.amount = goalBody.amount
    goal.completeAt = goalBody.completeAt
    goal.recurrence = goalBody.recurrence

    try await goal.save(on: request.db)

    return goal
  }

  func delete(request: Request) async throws -> Bool {
    guard
      let goal = try await Goal.find(
        request.parameters.get("id", as: UUID.self), on: request.db)
    else {
      throw Abort(.notFound)
    }
    try await goal.delete(on: request.db)
    return true
  }
}
