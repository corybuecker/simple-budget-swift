import Fluent
import Vapor

struct AccountSerializer: Content {
  var id: String
  var name: String
  var amount: String?
  var debt: Bool
}

struct AccountParams: Content, Validatable {
  static func validations(_ validations: inout Vapor.Validations) {
    validations.add(
      "amount", as: String.self, is: DecimalValidator.valid, required: true,
      customFailureDescription: "is not a valid number")

    validations.add("name", as: String.self, is: !.empty, required: true)
  }

  var name: String
  var amount: Decimal
  var debt: Bool
}

struct AccountErrors: Content {
  var field: String
  var error: String?
}

struct AccountsController: RouteCollection {
  func boot(routes: RoutesBuilder) throws {
    let accounts = routes.grouped("accounts")
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
    let accounts = try await Account.query(on: request.db).join(
      User.self, on: \Account.$user.$id == \User.$id
    ).filter(User.self, \User.$id == request.auth.require(SessionToken.self).user.requireID()).all()

    let serializedAccounts = try accounts.map({ (account) -> AccountSerializer in
      try AccountSerializer(
        id: account.requireID().uuidString,
        name: account.name,
        amount: CurrencyService(account.amount).withCents(),
        debt: account.debt
      )
    })
    return try await request.view.render("accounts/index", ["accounts": serializedAccounts])
  }

  func new(request: Request) async throws -> View {
    return try await request.view.render("accounts/new")
  }

  func create(request: Request) async throws -> Response {
    let accountErrors: [AccountErrors] = try AccountParams.validations().validate(request: request)
      .results.filter({
        result in
        result.isFailure
      }).map({ request in
        AccountErrors(
          field: request.key.stringValue,
          error: request.customFailureDescription ?? request.failureDescription)
      })

    if !accountErrors.isEmpty {
      let response = request.view.render("accounts/create", ["errors": accountErrors])
        .encodeResponse(for: request)
      return try await response.map({ response in
        response.headers.contentType = HTTPMediaType(
          type: "text/vnd.turbo-stream.html", subType: "charset=utf-8")
        return response
      }).get()
    }

    let accountParams = try request.content.decode(AccountParams.self)
    let account = try Account(request.auth.require(SessionToken.self).user.requireID())

    account.name = accountParams.name
    account.amount = accountParams.amount
    account.debt = accountParams.debt

    try await account.save(on: request.db)

    return try request.redirect(to: "/accounts/\(account.requireID())")
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

  func update(request: Request) async throws -> Response {
    guard
      let account = try await Account.find(
        request.parameters.get("id", as: UUID.self), on: request.db)
    else {
      throw Abort(.notFound)
    }

    let accountErrors: [AccountErrors] = try AccountParams.validations().validate(request: request)
      .results.filter({
        result in
        result.isFailure
      }).map({ request in
        AccountErrors(
          field: request.key.stringValue,
          error: request.customFailureDescription ?? request.failureDescription)
      })

    if !accountErrors.isEmpty {
      let response = request.view.render("accounts/update", ["errors": accountErrors])
        .encodeResponse(for: request)
      return try await response.map({ response in
        response.headers.contentType = HTTPMediaType(
          type: "text/vnd.turbo-stream.html", subType: "charset=utf-8")
        return response
      }).get()
    }

    let accountBody = try request.content.decode(AccountParams.self)

    account.name = accountBody.name
    account.amount = accountBody.amount
    account.debt = accountBody.debt

    try await account.save(on: request.db)

    return request.redirect(to: "/accounts")
  }

  func delete(request: Request) async throws -> Response {
    guard
      let account = try await Account.find(
        request.parameters.get("id", as: UUID.self), on: request.db)
    else {
      throw Abort(.notFound)
    }
    try await account.delete(on: request.db)

    return request.redirect(to: "/accounts")
  }

  private func getAccount() -> Account? {
    return nil
  }
}
