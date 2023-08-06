import Fluent
import Vapor

struct OidcResponse: Content {
  var id_token: String
  var access_token: String
}

struct Identity: Content {
  var sub: String
  var name: String
  var given_name: String
  var family_name: String
  var picture: String
  var email: String
  var email_verified: Bool
  var locale: String
}

struct AuthenticationController: RouteCollection {
  private var app: Application

  init(_ app: Application) {
    self.app = app
  }

  func boot(routes: RoutesBuilder) throws {
    let authentication = routes.grouped("authentication").grouped(SessionTokenAuthenticator())

    authentication.get(use: redirect)
    authentication.get("callback", use: create)
  }

  func redirect(request: Request) async throws -> Response {
    request.session.data = [:]

    let nonce = UUID()
    let state = UUID()

    request.session.data["state"] = state.uuidString

    var urlComponents = URLComponents(string: "https://accounts.google.com/o/oauth2/v2/auth")
    urlComponents?.queryItems = [
      URLQueryItem(name: "client_id", value: Environment.get("GOOGLE_CLIENT_ID")),
      URLQueryItem(name: "redirect_uri", value: Environment.get("GOOGLE_CALLBACK")),
      URLQueryItem(name: "response_type", value: "code"),
      URLQueryItem(name: "scope", value: "openid profile email"),
      URLQueryItem(name: "state", value: state.uuidString),
      URLQueryItem(name: "nonce", value: nonce.uuidString),
    ]

    guard let redirect = urlComponents?.url?.absoluteString else {
      throw Abort(.badRequest)
    }

    return request.redirect(to: redirect)
  }

  func create(request: Request) async throws -> Response {
    guard let state = request.session.data["state"] else {
      throw Abort(.badRequest)
    }

    request.session.data = [:]

    guard let requestState: String? = request.query["state"] else {
      throw Abort(.badRequest)
    }
    if requestState != state {
      throw Abort(.badRequest)
    }

    var urlComponents = URLComponents(string: "https://oauth2.googleapis.com/token")

    urlComponents?.queryItems = [
      URLQueryItem(name: "code", value: request.query["code"]),
      URLQueryItem(name: "client_id", value: Environment.get("GOOGLE_CLIENT_ID")),
      URLQueryItem(name: "client_secret", value: Environment.get("GOOGLE_CLIENT_SECRET")),
      URLQueryItem(name: "redirect_uri", value: Environment.get("GOOGLE_CALLBACK")),
      URLQueryItem(name: "grant_type", value: "authorization_code"),
    ]

    guard let exchangeUrl = urlComponents?.url else {
      throw Abort(.badRequest)
    }

    let client = request.client
    var response = try await client.post(URI(string: exchangeUrl.absoluteString))
    let token = try response.content.decode(OidcResponse.self)

    response = try await client.get(
      "https://openidconnect.googleapis.com/v1/userinfo",
      headers: HTTPHeaders([("Authorization", "Bearer \(token.access_token)")]))

    let identity = try response.content.decode(Identity.self)

    guard
      let user = try await User.query(on: request.db).filter(\User.$email == identity.email).first()
    else {
      throw Abort(.notFound)
    }

    let sessionToken = try SessionToken(user.requireID())
    try await sessionToken.save(on: request.db)

    request.auth.login(sessionToken)

    return request.redirect(to: "/")
  }
}
