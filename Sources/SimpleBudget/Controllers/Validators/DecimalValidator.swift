import Vapor

struct DecimalValidatorResult: ValidatorResult {
  public let isValid: Bool

  var isFailure: Bool {
    !isValid
  }
  var successDescription: String? = "Decimal is valid"
  var failureDescription: String? = "Decimal is invalid"
}

struct DecimalValidator {
  public static var valid: Validator<String> {
    Validator<String>(validate: { (input) in
      if Decimal(string: input) != nil {
        return DecimalValidatorResult(isValid: true)
      }

      return DecimalValidatorResult(isValid: false)
    })
  }
}
