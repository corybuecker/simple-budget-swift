import Vapor

struct DatesService {
  enum DatesServiceError: Error {
    case unexpectedDate
  }

  private let from: Date
  private let calendar: Calendar

  init() {
    self.from = Date()
    self.calendar = Calendar.init(identifier: .gregorian)
  }

  init(_ from: Date) {
    self.from = from
    self.calendar = Calendar.init(identifier: .gregorian)
  }

  func startOfMonth() throws -> Date {
    let components = self.calendar.dateComponents([.year, .month], from: self.from)
    guard let optDate = self.calendar.date(from: components) else {
      throw DatesServiceError.unexpectedDate
    }
    return optDate
  }

  func endOfMonth() throws -> Date {
    let startOfMonth = try startOfMonth()
    let components = DateComponents(month: 1, second: -1)
    guard let endOfMonth = self.calendar.date(byAdding: components, to: startOfMonth) else {
      throw DatesServiceError.unexpectedDate
    }
    return endOfMonth
  }

  func startOfNextMonth() throws -> Date {
    let addComponents = DateComponents(month: 1)

    guard let nextMonth = self.calendar.date(byAdding: addComponents, to: self.from) else {
      throw DatesServiceError.unexpectedDate
    }

    let nextMonthComponents = self.calendar.dateComponents([.year, .month], from: nextMonth)

    guard let optDate = self.calendar.date(from: nextMonthComponents) else {
      throw DatesServiceError.unexpectedDate
    }
    return optDate
  }

  func endOfNextMonth() throws -> Date {
    let startOfNextMonth = try startOfNextMonth()
    let components = DateComponents(month: 1, second: -1)
    guard let endOfNextMonth = self.calendar.date(byAdding: components, to: startOfNextMonth) else {
      throw DatesServiceError.unexpectedDate
    }
    return endOfNextMonth
  }

  func isEndOfMonth() throws -> Bool {
    let dateComponents = self.calendar.dateComponents([.year, .month, .day], from: self.from)
    let endOfMonthComponents = try self.calendar.dateComponents(
      [.year, .month, .day], from: endOfMonth())

    return dateComponents.year == endOfMonthComponents.year
      && dateComponents.month == endOfMonthComponents.month
      && dateComponents.day == endOfMonthComponents.day
  }

  func daysUntilEndOfMonth() throws -> Int {
    if try isEndOfMonth() {
      guard
        let days = try self.calendar.dateComponents(
          [.day], from: self.from, to: endOfNextMonth()
        ).day
      else {
        throw DatesServiceError.unexpectedDate
      }
      return days
    }

    guard
      let days = try self.calendar.dateComponents([.day], from: self.from, to: endOfMonth())
        .day
    else {
      throw DatesServiceError.unexpectedDate
    }
    return days
  }
}
