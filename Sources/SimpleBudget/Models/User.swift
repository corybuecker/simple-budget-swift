import Fluent
import Foundation
import Vapor

final class User: Model, Authenticatable, Content {
  static let schema: String = "users"

  @ID()
  var id: UUID?

  @Timestamp(key: "created_at", on: .create)
  var createdAt: Date?

  @Timestamp(key: "updated_at", on: .update)
  var updatedAt: Date?

  @Children(for: \Account.$user)
  var accounts: [Account]

  @Children(for: \Saving.$user)
  var savings: [Saving]

  @Children(for: \Goal.$user)
  var goals: [Goal]

  init() {}
}
