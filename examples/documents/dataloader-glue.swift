// nocompile — framework glue: depends on the PrimitiveApp SwiftUI package
// (swift-primitive-app-dev), which is not part of this repo's compile harness.
import SwiftUI
import PrimitiveApp

struct TaskListView: View {
  @EnvironmentObject var appState: MyAppState

  // #region example
  @StateObject private var loader = BaoDataLoader<[TaskRecord]>()

  var body: some View {
    List(loader.data ?? [], id: \.id) { task in
      Text(task.title)
    }
    .task {
      loader.documentReady = appState.selectedDocId != nil
      loader.bind(client: appState.client, subscribeTo: [.onModel(subscribe: TaskRecord.subscribe)]) { _ in
        TaskRecord.findAll()
          .filter { !$0.completed }
          .sorted { $0.priority > $1.priority }
      }
    }
    .onChange(of: appState.selectedDocId) { _, id in
      loader.documentReady = id != nil
    }
  }
  // #endregion example
}
