// nocompile — framework glue: depends on the PrimitiveApp SwiftUI package
// (swift-primitive-app-dev), which is not part of this repo's compile harness.
// no-parity — SwiftUI detail view using PrimitiveApp's auxiliary-doc lifecycle;
// no TS twin. The compiled core it reads through is the document-scoped facade
// query (documents/doc-open-query).
import SwiftUI
import PrimitiveApp

// #region example
struct ItemDetailView: View {
    let documentId: String
    @EnvironmentObject var appState: MyAppState
    @State private var todos: [TodoItem]?

    var body: some View {
        Group {
            if let todos { /* render */ } else { ProgressView() }
        }
        .task {
            _ = try? await appState.openAuxiliaryDoc(documentId)
            todos = try? TodoItem.query([:], options: QueryOptions(documents: [documentId]))
        }
        .onDisappear { Task { await appState.closeAuxiliaryDoc(documentId) } }
    }
}
// #endregion example
