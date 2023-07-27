import Fluent
import Vapor

struct SavingBody: Content {
  var name: String
  var amount: Decimal
}

struct SavingsController: RouteCollection {
  func boot(routes: RoutesBuilder) throws {
    let savings = routes.grouped("api", "savings")
      .grouped(SessionTokenAuthenticator())
      .grouped(SessionToken.guardMiddleware())

    savings.get(use: index)
    savings.get(":id", use: edit)
    savings.patch(":id", use: update)
    savings.post(use: create)
    savings.delete(":id", use: delete)
  }

  func index(request: Request) async throws -> [Saving] {
    try await Saving.query(on: request.db).all()
  }

  func edit(request: Request) async throws -> Saving {
    guard
      let saving = try await Saving.find(
        request.parameters.get("id", as: UUID.self), on: request.db)
    else {
      throw Abort(.notFound)
    }
    return saving
  }

  func update(request: Request) async throws -> Saving {
    guard
      let saving = try await Saving.find(
        request.parameters.get("id", as: UUID.self), on: request.db)
    else {
      throw Abort(.notFound)
    }

    let savingBody = try request.content.decode(SavingBody.self)

    saving.name = savingBody.name
    saving.amount = savingBody.amount

    try await saving.save(on: request.db)

    return saving
  }

  func create(request: Request) async throws -> Saving {
    let savingBody = try request.content.decode(SavingBody.self)

    let saving = try Saving(request.auth.require(SessionToken.self).user.requireID())
    saving.name = savingBody.name
    saving.amount = savingBody.amount

    try await saving.save(on: request.db)

    return saving
  }

  func delete(request: Request) async throws -> Bool {
    guard
      let saving = try await Saving.find(
        request.parameters.get("id", as: UUID.self), on: request.db)
    else {
      throw Abort(.notFound)
    }
    try await saving.delete(on: request.db)
    return true
  }
}
