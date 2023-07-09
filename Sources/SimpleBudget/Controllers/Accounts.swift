import Fluent
import Vapor

struct AccountBody: Content {
  var name: String
  var amount: Decimal
  var debt: Bool
}

struct AccountsController: RouteCollection {
  func boot(routes: RoutesBuilder) throws {
    let accounts = routes.grouped("api", "accounts").grouped(Authenticator())

    accounts.get(use: index)
    accounts.get(":id", use: edit)
    accounts.patch(":id", use: update)
    accounts.post(use: create)
    accounts.delete(":id", use: delete)
  }

  func index(request: Request) async throws -> [Account] {
    try await Account.query(on: request.db).all()
  }

  func edit(request: Request) async throws -> Account {
    guard
      let account = try await Account.find(
        request.parameters.get("id", as: UUID.self), on: request.db)
    else {
      throw Abort(.notFound)
    }
    return account
  }

  func update(request: Request) async throws -> Account {
    guard
      let account = try await Account.find(
        request.parameters.get("id", as: UUID.self), on: request.db)
    else {
      throw Abort(.notFound)
    }

    let accountBody = try request.content.decode(AccountBody.self)

    account.name = accountBody.name
    account.amount = accountBody.amount
    account.debt = accountBody.debt

    try await account.save(on: request.db)

    return account
  }

  func create(request: Request) async throws -> Account {
    let accountBody = try request.content.decode(AccountBody.self)

    let account = try Account(request.auth.get(User.self)?.requireID())
    account.name = accountBody.name
    account.amount = accountBody.amount
    account.debt = accountBody.debt

    try await account.save(on: request.db)

    return account
  }

  func delete(request: Request) async throws -> Bool {
    guard
      let account = try await Account.find(
        request.parameters.get("id", as: UUID.self), on: request.db)
    else {
      throw Abort(.notFound)
    }
    try await account.delete(on: request.db)
    return true
  }
}
