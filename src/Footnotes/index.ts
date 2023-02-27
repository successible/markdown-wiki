import * as vscode from 'vscode'
import { EXTENSION_NAME } from '../extension'
import { insertFootnoteInFile } from './helpers/insertFootnoteInFile'
import { reorderFootnotesInFile } from './helpers/reorderFootnotesInFile'

export const Footnotes = async (context: vscode.ExtensionContext) => {
  const commands = [
    vscode.commands.registerCommand(
      `${EXTENSION_NAME}.insertFootnote`,
      async () => await insertFootnoteInFile()
    ),
    vscode.commands.registerCommand(
      `${EXTENSION_NAME}.reorderFootnotes`,
      async () => await reorderFootnotesInFile()
    ),
  ]

  context.subscriptions.push(...commands)
}
