import Foundation

struct GoalService {
  private let goal: Goal

  private let day: Double = 60 * 60 * 24.0
  private let week: Double = 60 * 60 * 24.0 * 7
  private let month: Double = 60 * 60 * 24.0 * 30
  private let quarter: Double = 60 * 60 * 24.0 * 30 * 3
  private let year: Double = 60 * 60 * 24.0 * 30 * 12

  init(goal: Goal) {
    self.goal = goal
  }

  func amortized() -> Decimal {
    if Date() >= self.goal.completeAt {
      return self.goal.amount
    }

    return dailyAmount() * Decimal(elapsedDays())
  }

  private func dailyAmount() -> Decimal {
    return self.goal.amount
      / Decimal(DateInterval(start: startDate(), end: self.goal.completeAt).duration / day)
  }

  private func elapsedDays() -> Double {
    if Date() < startDate() {
      return 0
    }

    return DateInterval(start: startDate(), end: Date()).duration / day
  }

  private func startDate() -> Date {
    switch self.goal.recurrence {
    case GoalRecurrence.daily:
      return self.goal.completeAt - day
    case GoalRecurrence.weekly:
      return self.goal.completeAt - week
    case GoalRecurrence.monthly:
      return self.goal.completeAt - month
    case GoalRecurrence.quarterly:
      return self.goal.completeAt - quarter
    case GoalRecurrence.yearly:
      return self.goal.completeAt - year
    default:
      guard let createdAt = self.goal.createdAt else {
        return Date()
      }
      return createdAt
    }
  }

  private func daysRemaining() -> Double {
    if Date() > self.goal.completeAt {
      return 0
    }

    let interval = DateInterval(start: Date(), end: self.goal.completeAt)
    return interval.duration / day
  }
}
