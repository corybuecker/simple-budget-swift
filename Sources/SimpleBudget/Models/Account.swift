import Fluent
import Vapor

final class Account: Model, Content {
  static let schema: String = "accounts"

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

  @Field(key: "debt")
  var debt: Bool

  @Parent(key: "user_id")
  var user: User

  init() {}

  init(_ userId: User.IDValue?) throws {
    self.debt = false
    if let userIdValue = userId {
      self.$user.id = userIdValue
    }
  }
}
