import Fluent
import FluentPostgresDriver
import NIOSSL
import Vapor

public func configure(_ app: Application) async throws {
  app.middleware.use(FileMiddleware(publicDirectory: app.directory.publicDirectory))

  app.databases.use(
    .postgres(
      configuration: SQLPostgresConfiguration(
        hostname: Environment.get("DATABASE_HOST") ?? "localhost",
        port: Environment.get("DATABASE_PORT").flatMap(Int.init(_:))
          ?? SQLPostgresConfiguration.ianaPortNumber,
        username: Environment.get("DATABASE_USERNAME") ?? "postgres",
        password: Environment.get("DATABASE_PASSWORD") ?? "",
        database: Environment.get("DATABASE_NAME") ?? "simple_budget",
        tls: .prefer(try .init(configuration: .clientDefault)))
    ), as: .psql)

  app.logger.logLevel = .debug

  app.migrations.add(UsersMigration())
  app.migrations.add(AccountsMigration())
  app.migrations.add(SavingsMigration())
  app.migrations.add(GoalsMigration())
  try await app.autoMigrate()

  try routes(app)
}
