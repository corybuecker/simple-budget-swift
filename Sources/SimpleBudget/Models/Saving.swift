import Fluent
import Foundation
import Vapor

final class Saving: Model, Content {
  static let schema: String = "savings"

  @ID()
  var id: UUID?

  @Timestamp(key: "created_at", on: .create)
  var createdAt: Date?

  @Timestamp(key: "updated_at", on: .update)
  var updatedAt: Date?

  @Field(key: "name")
  var name: String

  @Field(key: "amount")
  var amount: Decimal

  @Parent(key: "user_id")
  var user: User

  init() {}

  init(_ userId: User.IDValue?) throws {
    if let userIdValue = userId {
      self.$user.id = userIdValue
    }
  }
}
