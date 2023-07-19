import Fluent
import FluentPostgresDriver
import NIOSSL
import Vapor

struct EnvironmentError: Error {}

public func configure(_ app: Application) async throws {
  app.middleware.use(FileMiddleware(publicDirectory: app.directory.publicDirectory))
  
  guard let databaseHost = Environment.get("DATABASE_HOST") else {
    throw EnvironmentError()
  }
  
  app.databases.use(
    .postgres(
      configuration: SQLPostgresConfiguration(
        hostname: databaseHost,
        port: SQLPostgresConfiguration.ianaPortNumber,
        username: "simple_budget",
        password: Environment.get("DATABASE_PASSWORD"),
        database: "simple_budget",
        tls: .disable
      )
    ), as: .psql)

  app.logger.logLevel = .debug

  app.sessions.use(.fluent(.psql))
  app.sessions.configuration.cookieFactory = { sessionID in
    HTTPCookies.Value.init(string: sessionID.string, expires: Date() + 10 * 60)
  }
  app.middleware.use(app.sessions.middleware)

  app.migrations.add(UsersMigration())
  app.migrations.add(AccountsMigration())
  app.migrations.add(SavingsMigration())
  app.migrations.add(GoalsMigration())
  app.migrations.add(SessionRecord.migration)
  try await app.autoMigrate()

  try routes(app)
}
