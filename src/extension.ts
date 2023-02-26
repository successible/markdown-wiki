import * as vscode from 'vscode'

import { Analysis } from './Analysis'
import { Footnotes } from './Footnotes'
import { Links } from './Links'

export const activate = async (context: vscode.ExtensionContext) => {
  const [analysis, linking] = ['analysis', 'linking'].map((name) => {
    const collection = vscode.languages.createDiagnosticCollection(name)
    context.subscriptions.push(collection)
    return collection
  })

  await Analysis(context, analysis)
  await Footnotes(context)
  await Links(context, linking)

  console.log('Markdown Wiki activated!')
}

export function deactivate() {
  console.log('Markdown Wiki deactivated!')
}
