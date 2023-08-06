import Fluent
import Vapor

func routes(_ app: Application) throws {
  try app.register(collection: AccountsController())
  try app.register(collection: SavingsController())
  try app.register(collection: GoalsController())
  try app.register(collection: DashboardController())
  try app.register(collection: AuthenticationController(app))
}
