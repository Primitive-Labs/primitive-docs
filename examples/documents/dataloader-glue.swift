// nocompile — framework glue: depends on the PrimitiveApp SwiftUI package
// (swift-primitive-app-dev), which is not part of this repo's compile harness.
import SwiftUI
import PrimitiveApp

// #region example
struct TodoListView: View {
    @EnvironmentObject var appState: MyAppState
    @StateObject private var loader = BaoDataLoader<[TodoItem]>()

    var body: some View {
        Group {
            // Render through `loader.phase`, not `loader.data ?? []`.
            // `?? []` collapses "not yet loaded" with "loaded, empty",
            // flashing the empty state for ~50ms on every appearance.
            switch loader.phase {
            case .loading:           ProgressView()
            case .empty:             Text("No todos yet")
            case .loaded(let todos): List(todos) { /* row */ }
            }
        }
        // Bind once, from a plain `.task`. Don't conditionally bind on
        // doc readiness — set `loader.documentReady` instead: the loader
        // fires its initial load when it flips to true, and resets
        // `initialDataLoaded` if the doc closes.
        .task {
            loader.documentReady = appState.selectedDocId != nil
            loader.bind(
                client: appState.client,
                subscribeTo: [.onModel(subscribe: TodoItem.subscribe)]
            ) { _ in
                TodoItem.findAll().sorted { $0.sortOrder < $1.sortOrder }
            }
        }
        .onChange(of: appState.selectedDocId) { _, id in
            loader.documentReady = id != nil
        }
    }
}
// #endregion example
