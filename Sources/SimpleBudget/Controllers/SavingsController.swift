import Fluent
import Vapor

struct SavingSerializer: Content {
  var id: String
  var name: String
  var amount: String?
}

struct SavingParams: Content {
  var name: String
  var amount: Decimal
}

struct SavingsController: RouteCollection {
  func boot(routes: RoutesBuilder) throws {
    let savings = routes.grouped("savings")
      .grouped(SessionTokenAuthenticator())
      .grouped(SessionToken.redirectMiddleware(path: "/authentication"))

    savings.get(use: index)
    savings.get("new", use: new)
    savings.get(":id", use: edit)
    savings.patch(":id", use: update)
    savings.post(use: create)
    savings.delete(":id", use: delete)
  }

  func index(request: Request) async throws -> View {
    let savings = try await Saving.query(on: request.db).sort(\Saving.$name).all()
    let serializedSavings = try savings.map({ (saving) -> SavingSerializer in
      try SavingSerializer(
        id: saving.requireID().uuidString,
        name: saving.name,
        amount: CurrencyService(saving.amount).withCents()
      )
    })
    return try await request.view.render("savings/index", ["savings": serializedSavings])
  }

  func new(request: Request) async throws -> View {
    return try await request.view.render("savings/new")
  }

  func create(request: Request) async throws -> Response {
    let savingParams = try request.content.decode(SavingParams.self)

    let saving = try Saving(request.auth.require(SessionToken.self).user.requireID())
    saving.name = savingParams.name
    saving.amount = savingParams.amount

    try await saving.save(on: request.db)

    return try request.redirect(to: "/savings/\(saving.requireID())")
  }

  func edit(request: Request) async throws -> View {
    guard
      let saving = try await Saving.find(
        request.parameters.get("id", as: UUID.self), on: request.db)
    else {
      throw Abort(.notFound)
    }
    let serializedSaving = try SavingSerializer(
      id: saving.requireID().uuidString, name: saving.name, amount: saving.amount.description)
    return try await request.view.render("savings/edit", ["saving": serializedSaving])
  }

  func update(request: Request) async throws -> View {
    guard
      let saving = try await Saving.find(
        request.parameters.get("id", as: UUID.self), on: request.db)
    else {
      throw Abort(.notFound)
    }

    let savingBody = try request.content.decode(GoalParams.self)

    saving.name = savingBody.name
    saving.amount = savingBody.amount

    try await saving.save(on: request.db)
    let serializedSaving = try SavingSerializer(
      id: saving.requireID().uuidString, name: saving.name, amount: saving.amount.description)
    return try await request.view.render("savings/edit", ["saving": serializedSaving])
  }

  func delete(request: Request) async throws -> Response {
    guard
      let saving = try await Saving.find(
        request.parameters.get("id", as: UUID.self), on: request.db)
    else {
      throw Abort(.notFound)
    }
    try await saving.delete(on: request.db)
    return request.redirect(to: "/savings")
  }
}
