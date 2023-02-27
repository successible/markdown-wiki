import * as vscode from 'vscode'
import { WikiLink } from './services/WikiLink'

export const Linking = async (context: vscode.ExtensionContext) => {
  const selectors = [
    { language: 'markdown', scheme: 'file' },
    { language: 'markdown', scheme: 'untitled' },
  ]
  const linkProvider = vscode.languages.registerDocumentLinkProvider(
    selectors,
    new WikiLink(context)
  )
  context.subscriptions.push(linkProvider)
}
