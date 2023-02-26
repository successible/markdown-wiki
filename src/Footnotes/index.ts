import * as vscode from 'vscode'
import { insertFootnoteInFile } from './insertFootnoteInFile'
import { reorderFootnotesInFile } from './reorderFootnotesInFile'

export const Footnotes = async (context: vscode.ExtensionContext) => {
  const name = 'markdown-wiki'
  const register = vscode.commands.registerCommand

  const commands = [
    register(
      `${name}.insertFootnoteInFile`,
      async () => await insertFootnoteInFile()
    ),
    register(
      `${name}.reorderFootnotesInFile`,
      async () => await reorderFootnotesInFile()
    ),
  ]

  context.subscriptions.push(...commands)
}
