// Reference: https://github.com/microsoft/vscode-extension-samples/blob/main/code-actions-sample/src/diagnostics.ts

import * as vscode from 'vscode'
import { EXTENSION_NAME } from '../extension'
import { analyzeDocuments } from './helpers/analyzeDocuments'
import { debouncedAnalyzeDocument } from './helpers/debouncedAnalyzeDocument'
import { isMarkdownFile } from './helpers/isMarkdownFile'

export const error = vscode.DiagnosticSeverity.Error
export const info = vscode.DiagnosticSeverity.Information

export const Analytics = async (
  context: vscode.ExtensionContext,
  analytics: vscode.DiagnosticCollection
): Promise<void> => {
  const editor = vscode.window.activeTextEditor
  if (editor && isMarkdownFile(editor.document.uri)) {
    await debouncedAnalyzeDocument(
      context,
      editor.document,
      analytics,
      'onDidLoadTextDocument'
    )
  }

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(async (editor) => {
      if (isMarkdownFile(editor.document.uri)) {
        await debouncedAnalyzeDocument(
          context,
          editor.document,
          analytics,
          'onDidChangeTextDocument'
        )
      }
    })
  )

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(async (document) => {
      if (isMarkdownFile(document.uri)) {
        await debouncedAnalyzeDocument(
          context,
          document,
          analytics,
          'onDidSaveTextDocument'
        )
      }
    })
  )

  vscode.window.onDidChangeActiveTextEditor(async (editor) => {
    if (editor && isMarkdownFile(editor.document.uri)) {
      await debouncedAnalyzeDocument(
        context,
        editor.document,
        analytics,
        'onDidChangeActiveTextEditor'
      )
    }
  })

  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((document) => {
      analytics.delete(document.uri)
    })
  )

  const commands = [
    vscode.commands.registerCommand(
      `${EXTENSION_NAME}.analyzeFiles`,
      async () => await analyzeDocuments(context, analytics)
    ),
  ]

  context.subscriptions.push(...commands)
}
