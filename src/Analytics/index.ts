// Reference: https://github.com/microsoft/vscode-extension-samples/blob/main/code-actions-sample/src/diagnostics.ts

import * as vscode from 'vscode'
import { EXTENSION_NAME } from '../extension'
import { analyzeDocuments } from './helpers/analyzeDocuments'
import { debouncedAnalyzeDocument } from './helpers/debouncedAnalyzeDocument'
import { isMarkdownFile } from './helpers/isMarkdownFile'

export const Analytics = async (
  context: vscode.ExtensionContext,
  analytics: vscode.DiagnosticCollection,
  statusBar: vscode.StatusBarItem
): Promise<void> => {
  const editor = vscode.window.activeTextEditor
  if (editor && isMarkdownFile(editor.document.uri)) {
    await debouncedAnalyzeDocument(
      context,
      editor.document,
      analytics,
      'onDidLoadTextDocument',
      statusBar
    )
  }

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(async (document) => {
      if (isMarkdownFile(document.uri)) {
        await debouncedAnalyzeDocument(
          context,
          document,
          analytics,
          'onDidSaveTextDocument',
          statusBar
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
        'onDidChangeActiveTextEditor',
        statusBar
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
    vscode.commands.registerCommand(
      `${EXTENSION_NAME}.analyzeFile`,
      async () => {
        const editor = vscode.window.activeTextEditor
        if (editor && isMarkdownFile(editor.document.uri)) {
          await debouncedAnalyzeDocument(
            context,
            editor.document,
            analytics,
            'onCommand',
            statusBar
          )
        } else {
          vscode.window.showInformationMessage('No markdown file is active.')
        }
      }
    ),
  ]

  context.subscriptions.push(...commands)
}
