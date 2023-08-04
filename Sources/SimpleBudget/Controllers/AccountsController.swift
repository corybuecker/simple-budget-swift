import Fluent
import Vapor

struct AccountSerializer: Content {
  var id: String
  var name: String
  var amount: String?
  var debt: Bool
}

struct AccountParams: Content {
  var name: String
  var amount: Decimal
  var debt: Bool
}

struct AccountsController: RouteCollection {
  func boot(routes: RoutesBuilder) throws {
    let accounts = routes.grouped("leaf", "accounts")
      .grouped(SessionTokenAuthenticator())
      .grouped(SessionToken.redirectMiddleware(path: "/authentication"))

    accounts.get(use: index)
    accounts.get("new", use: new)
    accounts.get(":id", use: edit)
    accounts.patch(":id", use: update)
    accounts.post(use: create)
    accounts.delete(":id", use: delete)
  }

  func index(request: Request) async throws -> View {
    let accounts = try await Account.query(on: request.db).sort(\Account.$name).all()
    let serializedAccounts = try accounts.map({ (account) -> AccountSerializer in
      try AccountSerializer(
        id: account.requireID().uuidString, name: account.name,
        amount: CurrencyService(account.amount).withCents(), debt: account.debt
      )
    })
    return try await request.view.render("accounts/index", ["accounts": serializedAccounts])
  }

  func new(request: Request) async throws -> View {
    return try await request.view.render("accounts/new")
  }

  func create(request: Request) async throws -> Response {
    let accountParams = try request.content.decode(AccountParams.self)

    let account = try Account(request.auth.require(SessionToken.self).user.requireID())
    account.name = accountParams.name
    account.amount = accountParams.amount
    account.debt = accountParams.debt

    try await account.save(on: request.db)

    return try request.redirect(to: "/leaf/accounts/\(account.requireID())")
  }

  func edit(request: Request) async throws -> View {
    guard
      let account = try await Account.find(
        request.parameters.get("id", as: UUID.self), on: request.db)
    else {
      throw Abort(.notFound)
    }
    let serializedAccount = try AccountSerializer(
      id: account.requireID().uuidString, name: account.name, amount: account.amount.description,
      debt: account.debt)
    return try await request.view.render("accounts/edit", ["account": serializedAccount])
  }

  func update(request: Request) async throws -> View {
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
    let serializedAccount = try AccountSerializer(
      id: account.requireID().uuidString, name: account.name, amount: account.amount.description,
      debt: account.debt)
    return try await request.view.render("accounts/edit", ["account": serializedAccount])
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
