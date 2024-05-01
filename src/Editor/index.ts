import type * as vscode from 'vscode'
import { Editor as EditorService } from './service/Editor'

export const Editor = async (context: vscode.ExtensionContext) => {
  context.subscriptions.push(EditorService.register(context))
}
