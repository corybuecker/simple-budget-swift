import Fluent
import Foundation
import Vapor

enum GoalRecurrence: String, Codable {
  case never
  case daily
  case weekly
  case monthly
  case quarterly
  case yearly
}

final class Goal: Model, Content {
  static let schema: String = "goals"

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

  @Field(key: "complete_at")
  var completeAt: Date

  @Parent(key: "user_id")
  var user: User

  @Enum(key: "recurrence")
  var recurrence: GoalRecurrence

  init() {}

  init(_ userId: User.IDValue?) throws {
    if let userIdValue = userId {
      self.$user.id = userIdValue
    }
  }
}
