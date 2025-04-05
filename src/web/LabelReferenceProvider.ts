import * as vscode from "vscode";
import WorkspaceParser from "./WorkspaceParser";

export default class LabelReferenceProvider
  implements vscode.ReferenceProvider
{
  constructor(private workspaceParser: WorkspaceParser) {}

  public provideReferences(
    document: vscode.TextDocument,
    position: vscode.Position,
    options: vscode.ReferenceContext,
    token: vscode.CancellationToken,
  ): vscode.ProviderResult<vscode.Location[]> {
    const wordRange = document.getWordRangeAtPosition(position);
    if (!wordRange) {
      return [];
    }

    const label = document.getText(wordRange);

    const locations: vscode.Location[] = [];

    return locations;
  }
}
