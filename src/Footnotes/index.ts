import * as vscode from 'vscode'
import { insertFootnoteInFile } from './helpers/insertFootnoteInFile'
import { reorderFootnotesInFile } from './helpers/reorderFootnotesInFile'

export const Footnotes = async (context: vscode.ExtensionContext) => {
  const name = 'markdown-wiki'
  const register = vscode.commands.registerCommand

  const commands = [
    register(
      `${name}.insertFootnote`,
      async () => await insertFootnoteInFile()
    ),
    register(
      `${name}.reorderFootnotes`,
      async () => await reorderFootnotesInFile()
    ),
  ]

  context.subscriptions.push(...commands)
}
