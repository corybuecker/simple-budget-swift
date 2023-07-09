import Fluent

struct GoalsMigration: AsyncMigration {
  func prepare(on database: Database) async throws {
    let recurrence_enum = try await database.enum("goals_recurrence").case("never").case("daily")
      .case("weekly").case("monthly").case("quarterly").case("yearly").create()

    try await database
      .schema("goals")
      .id()
      .field(
        "user_id", .uuid, .required,
        .references("users", "id", onDelete: .cascade, onUpdate: .restrict)
      )
      .field("name", .string, .required)
      .field("amount", .sql(raw: "numeric(10,2)"), .required)
      .field("complete_at", .datetime, .required)
      .field("recurrence", recurrence_enum, .required)
      .field("created_at", .datetime, .required)
      .field("updated_at", .datetime, .required)
      .create()
  }

  func revert(on database: Database) async throws {
    try await database
      .schema("goals")
      .delete()
    try await database.enum("goal_recurrence").delete()
  }
}
