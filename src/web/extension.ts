import * as vscode from "vscode";
import LabelReferenceProvider from "./LabelReferenceProvider";
import WorkspaceParser from "./WorkspaceParser";

const selector: vscode.DocumentSelector = {
  scheme: "file",
  language: "gnu-assembler",
} as const;

export async function activate(context: vscode.ExtensionContext) {
  const workspaceParser = new WorkspaceParser();
  workspaceParser.registerSubscriptions(context);

  for (const file of await vscode.workspace.findFiles("**/*.{s,S}")) {
  }

  const labelReferenceProvider = new LabelReferenceProvider(workspaceParser);

  context.subscriptions.push(
    vscode.languages.registerReferenceProvider(
      selector,
      labelReferenceProvider,
    ),
  );
}

export function deactivate() {}
