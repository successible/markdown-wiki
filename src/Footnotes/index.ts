import * as vscode from 'vscode'
import { EXTENSION_NAME } from '../extension'
import { insertFootnoteInFile } from './helpers/insertFootnoteInFile'

export const Footnotes = async (context: vscode.ExtensionContext) => {
  const commands = [
    vscode.commands.registerCommand(
      `${EXTENSION_NAME}.insertFootnote`,
      async () => await insertFootnoteInFile()
    ),
  ]

  context.subscriptions.push(...commands)
}
