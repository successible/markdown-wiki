import * as vscode from 'vscode'
import { Analytics } from './Analytics'
import { Footnotes } from './Footnotes'
import { Linking } from './Linking'
import { SpellChecker } from './SpellChecker'

export const EXTENSION_NAME = 'markdown-wiki'

// extension.ts imports asynchronous functions that consume context.
// These functions are invoked on either events, like onDidChangeActiveTextEditor or custom commands.
// The context has access to the document of the editor.
// With it, you can loop through every line in the text. See run runDiagnosticsOnDocument for an example.

export const activate = async (context: vscode.ExtensionContext) => {
  // Clear the cache used by Linking
  await context.workspaceState.update('wikiLinks', {})

  // Create the diagnostics used by Analytics
  const analytics = vscode.languages.createDiagnosticCollection('analytics')
  context.subscriptions.push(analytics)

  // Create the status bar
  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    1000
  )

  // Enable all the services
  await Analytics(context, analytics, statusBar)
  await Footnotes(context)
  await Linking(context)
  await SpellChecker(context)

  console.log('Markdown Wiki activated!')
}

export function deactivate() {
  console.log('Markdown Wiki deactivated!')
}
