import * as vscode from 'vscode'

import { Analytics } from './Analytics'
import { Editor } from './Editor'
import { Footnotes } from './Footnotes'
import { Linking } from './Linking'

// extension.ts imports asynchronous functions that consume context.
// These functions are invoked on either events, like onDidChangeActiveTextEditor or custom commands.
// The context has access to the document of the editor.
// With it, you can loop through every line in the text. See run runDiagnosticsOnDocument for an example.

export const activate = async (context: vscode.ExtensionContext) => {
  const [analytics, linking] = ['analytics', 'linking'].map((name) => {
    const collection = vscode.languages.createDiagnosticCollection(name)
    context.subscriptions.push(collection)
    return collection
  })

  await Analytics(context, analytics)
  await Editor(context)
  await Footnotes(context)
  await Linking(context, linking)

  console.log('Markdown Wiki activated!')
}

export function deactivate() {
  console.log('Markdown Wiki deactivated!')
}
