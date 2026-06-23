// nocompile — framework glue: depends on the PrimitiveApp SwiftUI package
// (swift-primitive-app-dev), which is not part of this repo's compile harness.
// no-parity — PrimitiveApp lifecycle subclass; no TS twin (the web app wires
// connect/doc-open in its bootstrap, not via a portable client call). The
// compiled core it drives is the atomic resolve-or-create
// (documents/get-or-create-doc).
import PrimitiveApp

// #region example
@MainActor
final class MyAppState: PrimitiveAppState {
    // connectClient is `open` — call super first (it connects and fetches
    // /me + the document list), then run app-specific setup. Don't reach
    // for a Combine sink on `$isConnected`; this override is the path.
    override func connectClient() async {
        await super.connectClient()
        // Optional but recommended: pre-register models so every open
        // document is mirrored into the client's shared store immediately
        // (the facade also lazily registers on first read).
        client?.registerModels([TodoItem.self])
        await openLibraryDoc()
    }

    private func openLibraryDoc() async {
        guard let client else { return }
        do {
            // Atomic resolve-or-create. Don't split into aliases.resolve +
            // createWithAlias — that has a TOCTOU window where two clients
            // onboarding at once both create and one doc is lost.
            let result = try await client.documents.getOrCreateWithAlias(
                alias: DocumentAlias(scope: .user, aliasKey: "library"),
                title: "Library"
            )
            // selectDocumentAwaiting opens the doc and routes the base
            // class's sync hooks at it; facade reads see it immediately.
            await selectDocumentAwaiting(result.documentId)
        } catch {
            errorMessage = "Failed to open library: \(error.localizedDescription)"
        }
    }
}
// #endregion example
