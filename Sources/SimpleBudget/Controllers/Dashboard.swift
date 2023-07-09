import Fluent
import Vapor

struct DashboardController: RouteCollection {
  func boot(routes: RoutesBuilder) throws {
    let dashboard = routes.grouped("api", "dashboard").grouped(Authenticator())

    dashboard.get(use: index)
  }

  func index(request: Request) async throws -> [String: String] {
    guard
      let user = try await User.query(on: request.db)
        .with(\User.$accounts)
        .with(\User.$savings)
        .with(\User.$goals).first()
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
    
    let calendar = Calendar(identifier: .gregorian)
    let startOfMonthComponents = calendar.dateComponents([.year, .month], from: Date())
    guard let startOfMonth = calendar.date(from: startOfMonthComponents) else {
      throw Abort(.internalServerError)
    }
    var dateComponents = DateComponents()
    dateComponents.month = 1
    dateComponents.second = -1
    guard let endOfMonth = calendar.date(byAdding: dateComponents, to: startOfMonth) else {
      throw Abort(.internalServerError)
    }
    
    let daysRemaining = calendar.dateComponents([.day], from: Date(), to: endOfMonth)
    guard let day = daysRemaining.day else {
      throw Abort(.internalServerError)
    }
    return [
      "total": (accountTotal + savingTotal + goalTotal).description,
      "daysRemaining": day.description
    ]
  }
}
