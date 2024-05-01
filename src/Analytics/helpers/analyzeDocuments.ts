import fs from 'node:fs'
import { difference } from 'set-operations'
import * as vscode from 'vscode'
import { analyzeDocument } from './analyzeDocument'
import { getAllFilePaths } from './getAllFilePaths'

export const analyzeDocuments = async (
  context: vscode.ExtensionContext,
  analytics: vscode.DiagnosticCollection,
  mode: 'analyze' | 'delete'
) => {
  const diagnostics = [] as [vscode.Uri, vscode.Diagnostic[]][]
  const assetLinks: string[] = []
  let orphanedAssets

  vscode.window.withProgress(
    {
      cancellable: true,
      location: vscode.ProgressLocation.Notification,
      title: `Running the ${mode} command`,
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
        if (mode === 'analyze') {
          diagnostics.push([document.uri, result.diagnostics])
        }
      }

      if (mode === 'delete') {
        const allAssets = await getAllFilePaths(
          '**/*.{png,svg,jpeg,jpg,gif,wav,mp3}'
        )
        orphanedAssets = difference(allAssets, assetLinks)
        if (Array.isArray(orphanedAssets)) {
          for (const imagePath of orphanedAssets) {
            fs.unlinkSync(imagePath)
          }
        }
      }

      if (mode === 'analyze') {
        await analytics.set(diagnostics)
      }

      const showMessage = vscode.window.showInformationMessage
      if (mode === 'analyze') {
        showMessage('Analysis complete. Check the Problems tab for results.')
      } else {
        showMessage(`Removed ${orphanedAssets.length} orphaned assets`)
      }
    }
  )
}
