import Fluent

struct SavingsMigration: Migration {
  func prepare(on database: Database) -> EventLoopFuture<Void> {
    database
      .schema("savings")
      .id()
      .field(
        "user_id", .uuid, .required,
        .references("users", "id", onDelete: .cascade, onUpdate: .restrict)
      )
      .field("name", .string, .required)
      .field("amount", .sql(raw: "numeric(10,2)"), .required)
      .field("created_at", .datetime, .required)
      .field("updated_at", .datetime, .required)
      .create()
  }

  func revert(on database: Database) -> EventLoopFuture<Void> {
    database
      .schema("savings")
      .delete()
  }
}
