import Fluent
import Foundation
import Vapor

struct Dashboard: Content {
  var daysRemaining: Int
  var totalRemaining: String
  var totalRemainingPerDay: String
}

struct DashboardController: RouteCollection {
  func boot(routes: RoutesBuilder) throws {
    let dashboard =
      routes
      .grouped(SessionTokenAuthenticator())
      .grouped(SessionToken.redirectMiddleware(path: "/authentication"))

    dashboard.get(use: index)
  }

  func index(request: Request) async throws -> View {
    let sessionToken = try request.auth.require(SessionToken.self)

    guard
      let user = try await User.query(on: request.db)
        .with(\User.$accounts)
        .with(\User.$savings)
        .with(\User.$goals)
        .filter(\User.$id == sessionToken.user.requireID())
        .first()
    else {
      throw Abort(.notFound)
    }

    let accountTotal = user.accounts.reduce(
      Decimal(0.0),
      { memo, account in
        if account.debt {
          return memo - account.amount
        } else {
          return memo + account.amount
        }
      })

    let savingTotal = user.savings.reduce(
      Decimal(0.0),
      { memo, saving in
        memo - saving.amount
      })

    let goalTotal = user.goals.reduce(
      Decimal(0.0),
      { memo, goal in
        let goalService = GoalService(goal: goal)

        return memo - goalService.amortized()
      })

    guard let day = try? DatesService().daysUntilEndOfMonth() else {
      throw Abort(.internalServerError)
    }

    let totalRemaining = (accountTotal + goalTotal + savingTotal)
    let totalRemainingPerDay = totalRemaining / Decimal(day)

    return try await request.view.render(
      "dashboard",
      Dashboard(
        daysRemaining: day,
        totalRemaining: CurrencyService(totalRemaining).withoutCents() ?? "",
        totalRemainingPerDay: CurrencyService(totalRemainingPerDay).withMilliCents() ?? ""
      )
    )
  }
}
