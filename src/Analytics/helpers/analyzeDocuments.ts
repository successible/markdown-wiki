import fs from 'node:fs'
import * as vscode from 'vscode'
import { analyzeDocument } from './analyzeDocument'
import { getAllFilePaths } from './getAllFilePaths'

export const analyzeDocuments = async (
  context: vscode.ExtensionContext,
  analytics: vscode.DiagnosticCollection,
) => {
  const diagnostics = [] as [vscode.Uri, vscode.Diagnostic[]][]
  const assetLinks: string[] = []
  let orphanedAssets: string[]

  vscode.window.withProgress(
    {
      cancellable: true,
      location: vscode.ProgressLocation.Notification,
      title: `Running the analyze command`,
    },
    async (progress) => {
      const files = await getAllFilePaths()

      // The increment is summed up automatically by progress.report
      const increment = (1 / files.length) * 100
      for (const entry of files.entries()) {
        progress.report({ increment: increment })
        const openPath = vscode.Uri.file(entry[1])
        const document = await vscode.workspace.openTextDocument(openPath)
        const result = await analyzeDocument(context, document)
        assetLinks.push(...result.assetLinks)
        diagnostics.push([document.uri, result.diagnostics])
      }

      await analytics.set(diagnostics)
      const showMessage = vscode.window.showInformationMessage
      showMessage('Analysis complete. Check the Problems tab for results.')
    }
  )
}
