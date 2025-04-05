import * as vscode from "vscode";

export default class WorkspaceParser {
  public handleDidChangeTextDocument = (
    event: vscode.TextDocumentChangeEvent,
  ) => {};
  public handleDidOpenTextDocument = (event: vscode.TextDocument) => {};
  public handleDidCloseTextDocument = (event: vscode.TextDocument) => {};
  public handleDidSaveTextDocument = (event: vscode.TextDocument) => {};
  public handleDidCreateFiles = (event: vscode.FileCreateEvent) => {};
  public handleDidRenameFiles = (event: vscode.FileRenameEvent) => {};
  public handleDidDeleteFiles = (event: vscode.FileDeleteEvent) => {};
  public handleDidChangeWorkspaceFolders = (
    event: vscode.WorkspaceFoldersChangeEvent,
  ) => {};

  public registerSubscriptions(context: vscode.ExtensionContext) {
    context.subscriptions.push(
      vscode.workspace.onDidChangeTextDocument(
        this.handleDidChangeTextDocument,
      ),
      vscode.workspace.onDidOpenTextDocument(this.handleDidOpenTextDocument),
      vscode.workspace.onDidCloseTextDocument(this.handleDidCloseTextDocument),
      vscode.workspace.onDidSaveTextDocument(this.handleDidSaveTextDocument),
      vscode.workspace.onDidCreateFiles(this.handleDidCreateFiles),
      vscode.workspace.onDidRenameFiles(this.handleDidRenameFiles),
      vscode.workspace.onDidDeleteFiles(this.handleDidDeleteFiles),
      vscode.workspace.onDidChangeWorkspaceFolders(
        this.handleDidChangeWorkspaceFolders,
      ),
    );
  }
}
