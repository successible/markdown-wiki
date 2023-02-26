// Reference: https://github.com/microsoft/vscode-extension-samples/blob/main/code-actions-sample/src/diagnostics.ts

import * as vscode from 'vscode'
import { isMarkdownFile } from './helpers/isMarkdownFile'
import { runDiagnosticsOnDocument } from './helpers/runDiagnosticsOnDocument'

export const error = vscode.DiagnosticSeverity.Error
export const info = vscode.DiagnosticSeverity.Information

export const Analysis = async (
  context: vscode.ExtensionContext,
  analysis: vscode.DiagnosticCollection
): Promise<void> => {
  const editor = vscode.window.activeTextEditor
  if (editor && isMarkdownFile(editor.document.uri)) {
    const document = editor.document
    analysis.set([[document.uri, await runDiagnosticsOnDocument(document)]])
  }

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(async (editor) => {
      if (isMarkdownFile(editor.document.uri)) {
        const document = editor.document
        analysis.set([
          [
            document.uri,
            // Proselint is too slow to run on every text change
            await runDiagnosticsOnDocument(document, {
              enableProselint: false,
            }),
          ],
        ])
      }
    })
  )
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(async (document) => {
      if (isMarkdownFile(document.uri)) {
        analysis.set([[document.uri, await runDiagnosticsOnDocument(document)]])
      }
    })
  )
  vscode.window.onDidChangeActiveTextEditor(async (editor) => {
    if (editor && isMarkdownFile(editor.document.uri)) {
      const document = editor.document
      analysis.set([[document.uri, await runDiagnosticsOnDocument(document)]])
    }
  })
  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((document) => {
      analysis.delete(document.uri)
    })
  )
}
