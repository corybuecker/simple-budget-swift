// swift-tools-version:5.8
import PackageDescription

let package = Package(
  name: "SimpleBudget",
  platforms: [
    .macOS("13.3")
  ],
  dependencies: [
    .package(url: "https://github.com/vapor/vapor.git", from: "4.77.1"),
    .package(url: "https://github.com/vapor/fluent.git", from: "4.8.0"),
    .package(url: "https://github.com/vapor/fluent-postgres-driver.git", from: "2.8.0"),
    .package(url: "https://github.com/apple/swift-format.git", from: "508.0.1")
  ],
  targets: [
    .executableTarget(name: "SimpleBudget", dependencies: [
      .product(name: "Fluent", package: "fluent"),
      .product(name: "FluentPostgresDriver", package: "fluent-postgres-driver"),
      .product(name: "Vapor", package: "vapor")
    ]),
  ]
)
