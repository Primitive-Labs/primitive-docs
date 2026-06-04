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
      guard let tasks = appState.tasks else { return } // TypedModel<TaskRecord>
      loader.bind(client: appState.client, subscribeTo: [.onModelChange(tasks)]) { _ in
        tasks.findAll()
          .filter { !$0.completed }
          .sorted { $0.priority > $1.priority }
      }
    }
  }
  // #endregion example
}
