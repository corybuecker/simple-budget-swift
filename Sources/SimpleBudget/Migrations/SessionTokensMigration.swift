import Fluent

struct SessionTokensMigration: AsyncMigration {
  func prepare(on database: Database) async throws {
    try await database
      .schema("session_tokens")
      .id()
      .field(
        "user_id", .uuid, .required,
        .references("users", "id", onDelete: .cascade, onUpdate: .restrict)
      )
      .field("token", .uuid, .required)
      .field("expired_at", .datetime, .required)
      .field("created_at", .datetime, .required)
      .field("updated_at", .datetime, .required)
      .create()
  }

  func revert(on database: Database) async throws {
    try await database
      .schema("session_tokens")
      .delete()
  }
}
