import Fluent

struct UsersMigration: Migration {
  func prepare(on database: Database) -> EventLoopFuture<Void> {
    database
      .schema("users")
      .id()
      .field("email", .string, .required)
      .field("created_at", .datetime, .required)
      .field("updated_at", .datetime, .required)
      .create()
  }

  func revert(on database: Database) -> EventLoopFuture<Void> {
    database
      .schema("users")
      .delete()
  }
}
