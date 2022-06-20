// Reference: https://github.com/microsoft/vscode-extension-samples/blob/main/code-actions-sample/src/extension.ts
import * as vscode from 'vscode'
import { subscribeToDocumentChanges } from './diagnostics'
import {
  insertFootnoteCommand,
  reorderFootnotesInFileCommand,
  reorderFootnotesInWorkspaceCommand,
} from './commands'

export function activate(context: vscode.ExtensionContext) {
  const readabilityDiagnostics =
    vscode.languages.createDiagnosticCollection('readability')
  context.subscriptions.push(readabilityDiagnostics)
  subscribeToDocumentChanges(context, readabilityDiagnostics)

  context.subscriptions.push(insertFootnoteCommand)
  context.subscriptions.push(reorderFootnotesInFileCommand)
  context.subscriptions.push(reorderFootnotesInWorkspaceCommand)
}

export function deactivate() {}
