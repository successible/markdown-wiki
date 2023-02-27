import dayjs from 'dayjs'
import glob from 'glob'
import * as vscode from 'vscode'
import { analyzeDocument } from './analyzeDocument'

export const analyzeDocuments = async (
  context: vscode.ExtensionContext,
  analytics: vscode.DiagnosticCollection
) => {
  const start = dayjs()
  vscode.window.withProgress(
    {
      cancellable: false,
      location: vscode.ProgressLocation.Notification,
      title: 'Linting the workspace',
    },
    async (progress) => {
      if (vscode.workspace.workspaceFolders) {
        const workspace = vscode.workspace.workspaceFolders[0]
        const diagnostics = [] as [vscode.Uri, vscode.Diagnostic[]][]
        const files = glob.sync(`${workspace.uri.path}/**/*.md`, {})
        for (const [index, file] of files.entries()) {
          progress.report({ increment: (index + 1) / file.length })
          const openPath = vscode.Uri.file(file)
          const document = await vscode.workspace.openTextDocument(openPath)
          diagnostics.push([
            document.uri,
            await analyzeDocument(context, document),
          ])
        }
        analytics.set(diagnostics)
        const end = dayjs()
        vscode.window.showInformationMessage(
          `The workspace was analyzed in ${end.diff(start, 'seconds')} seconds!`
        )
      }
    }
  )
}
