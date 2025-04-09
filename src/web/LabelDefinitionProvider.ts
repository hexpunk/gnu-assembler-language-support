import * as vscode from "vscode";
import WorkspaceParser from "./WorkspaceParser";

export default class LabelDefinitionProvider
  implements vscode.DefinitionProvider
{
  constructor(private workspaceParser: WorkspaceParser) {}

  public provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
  ): vscode.ProviderResult<vscode.Definition> {
    const wordRange = document.getWordRangeAtPosition(position);
    if (!wordRange) {
      return [];
    }

    const label = document.getText(wordRange);

    const locations: vscode.Location[] = [];

    return locations;
  }
}
