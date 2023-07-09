import Vapor

struct Authenticator: AsyncRequestAuthenticator {
  func authenticate(request: Request) async throws {
    if let user = try await User.query(on: request.db).first() {
      request.auth.login(user)
    }
  }
}
