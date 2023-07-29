import Foundation

struct CurrencyService {
  let formatter: NumberFormatter
  let decimal: Decimal

  init(_ decimal: Decimal) {
    self.decimal = decimal
    self.formatter = NumberFormatter()
    self.formatter.currencyCode = "USD"
    self.formatter.numberStyle = NumberFormatter.Style.currency
  }

  func withoutCents() -> String? {
    self.formatter.maximumFractionDigits = 0
    self.formatter.minimumFractionDigits = 0

    return self.formatter.string(for: self.decimal)
  }

  func withCents() -> String? {
    self.formatter.maximumFractionDigits = 2
    self.formatter.minimumFractionDigits = 2

    return self.formatter.string(for: self.decimal)
  }

  func withMilliCents() -> String? {
    self.formatter.maximumFractionDigits = 3
    self.formatter.minimumFractionDigits = 3

    return self.formatter.string(for: self.decimal)
  }
}
