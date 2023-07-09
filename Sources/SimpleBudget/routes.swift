import Fluent
import Vapor

func rootRoute(app: Application, request: Request) throws -> Response {
  let indexFileUrl = URL(fileURLWithPath: "Public/index.html")
  let indexFileContents = try String(contentsOf: indexFileUrl, encoding: .utf8)

  return Response(
    status: .ok,
    headers: HTTPHeaders([("content-type", "text/html")]),
    body: Response.Body(stringLiteral: indexFileContents)
  )
}

func routes(_ app: Application) throws {
  app.get(
    "",
    use: { (Request) in
      return try rootRoute(app: app, request: Request)
    })

  app.get(
    "dashboard",
    use: { (Request) in
      return try rootRoute(app: app, request: Request)
    })

  app.get(
    "accounts",
    use: { (Request) in
      return try rootRoute(app: app, request: Request)
    })

  app.get(
    "accounts",
    "**",
    use: { (Request) in
      return try rootRoute(app: app, request: Request)
    })

  app.get(
    "savings",
    use: { (Request) in
      return try rootRoute(app: app, request: Request)
    })

  app.get(
    "savings",
    "**",
    use: { (Request) in
      return try rootRoute(app: app, request: Request)
    })

  app.get(
    "goals",
    use: { (Request) in
      return try rootRoute(app: app, request: Request)
    })

  app.get(
    "goals",
    "**",
    use: { (Request) in
      return try rootRoute(app: app, request: Request)
    })

  try app.register(collection: AccountsController())
  try app.register(collection: SavingsController())
  try app.register(collection: GoalsController())
  try app.register(collection: DashboardController())
}
