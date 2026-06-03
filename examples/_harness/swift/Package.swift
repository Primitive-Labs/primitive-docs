// swift-tools-version: 5.9
// Compile harness for the Swift example corpus.
//
// Consumes the vendored swift-client BY PATH (never modified) and runs
// `swift-bao-codegen` (via JsBaoCodegenPlugin) on the shared
// `Sources/DocsExamples/schema.toml` to generate model structs, then compiles
// every example `.swift` file in the target. `swift build` here is the gate:
// a snippet that misuses the client or a model fails the build.
//
// `scripts/compile-examples.mjs` copies the corpus `.swift` files and the
// fixture schema into Sources/DocsExamples/ before building.
import PackageDescription

let package = Package(
    name: "DocsExamples",
    platforms: [.macOS(.v13), .iOS(.v16)],
    dependencies: [
        .package(path: "../../../library_repos/js-bao-wss/swift-client"),
    ],
    targets: [
        .target(
            name: "DocsExamples",
            dependencies: [.product(name: "JsBaoClient", package: "swift-client")],
            path: "Sources/DocsExamples",
            plugins: [.plugin(name: "JsBaoCodegenPlugin", package: "swift-client")]
        )
    ]
)
