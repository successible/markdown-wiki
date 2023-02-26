import * as vscode from 'vscode'
import { WikiLink } from './services/WikiLink'

export const Linking = async (
  context: vscode.ExtensionContext,
  diagnostics: vscode.DiagnosticCollection
) => {
  const selectors = [
    { language: 'markdown', scheme: 'file' },
    { language: 'markdown', scheme: 'untitled' },
  ]
  const linkProvider = vscode.languages.registerDocumentLinkProvider(
    selectors,
    new WikiLink(diagnostics)
  )
  context.subscriptions.push(linkProvider)
}
