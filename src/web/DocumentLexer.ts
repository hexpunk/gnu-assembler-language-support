import * as vscode from "vscode";

type SimpleTokenKind = "Comma" | "Colon" | "Newline";

type ValueTokenKind =
  | "Mnemonic"
  | "Directive"
  | "Label"
  | "Identifier"
  | "Register"
  | "Immediate";

type TokenBase = {
  range: vscode.Range;
};

type Token =
  | ({ kind: SimpleTokenKind } & TokenBase)
  | ({ kind: ValueTokenKind; value: string } & TokenBase)
  | ({
      kind: "Comment";
      value: string;
      multiline: boolean;
      docComment: boolean;
    } & TokenBase)
  | ({ kind: "Invalid"; value: string; reason?: string } & TokenBase)
  | ({ kind: "EOF" } & TokenBase);
