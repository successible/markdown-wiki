import * as vscode from 'vscode'
import { insertFootnoteInFile } from './helpers/insertFootnoteInFile'
import { reorderFootnotesInFile } from './helpers/reorderFootnotesInFile'

export const Footnotes = async (context: vscode.ExtensionContext) => {
  const name = 'markdown-wiki'

  const commands = [
    vscode.commands.registerCommand(
      `${name}.insertFootnote`,
      async () => await insertFootnoteInFile()
    ),
    vscode.commands.registerCommand(
      `${name}.reorderFootnotes`,
      async () => await reorderFootnotesInFile()
    ),
  ]

  context.subscriptions.push(...commands)
}
