import * as vscode from 'vscode'
import { WikiLink } from './WikiLink'

export const Links = async (
  context: vscode.ExtensionContext,
  diagnostics: vscode.DiagnosticCollection
) => {
  const linkProvider = vscode.languages.registerDocumentLinkProvider(
    [
      { language: 'markdown', scheme: 'file' },
      { language: 'markdown', scheme: 'untitled' },
    ],
    new WikiLink(diagnostics)
  )
  context.subscriptions.push(linkProvider)
}
