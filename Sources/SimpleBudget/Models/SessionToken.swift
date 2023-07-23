import Fluent
import Vapor

enum SessionTokenError: Error {
  case userIdRequired
}

final class SessionToken: Model, Content, SessionAuthenticatable {
  static let schema: String = "session_tokens"

  var sessionID: UUID {
    self.token
  }

  @ID()
  var id: UUID?

  @Timestamp(key: "created_at", on: .create)
  var createdAt: Date?

  @Timestamp(key: "updated_at", on: .update)
  var updatedAt: Date?

  @Field(key: "token")
  var token: UUID

  @Field(key: "expired_at")
  var expiredAt: Date

  @Parent(key: "user_id")
  var user: User

  init() {}

  init(_ userId: User.IDValue?) throws {
    guard let userIdValue = userId else {
      throw SessionTokenError.userIdRequired
    }

    self.$user.id = userIdValue
    self.expiredAt = Date()
    self.expiredAt.addTimeInterval(600)
    self.token = UUID()
  }
}
