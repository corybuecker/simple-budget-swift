import Fluent
import Vapor

struct SessionTokenAuthenticator: AsyncSessionAuthenticator {
  typealias User = SessionToken

  func authenticate(sessionID: SessionToken.SessionID, for request: Request) async throws {
    if let sessionToken = try await SessionToken.query(on: request.db).with(\.$user)
      .filter(\.$token == sessionID)
      .filter(\.$expiredAt > Date())
      .first()
    {

      request.auth.login(sessionToken)
    }
  }
}
