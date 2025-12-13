import { get, uniq } from 'lodash'
import * as vscode from 'vscode'
import { getConfig } from '../Analytics/helpers/getConfig'

export const SpellChecker = (context: vscode.ExtensionContext) => {
  const provider: vscode.CodeActionProvider = {
    provideCodeActions(_document, _range, context, _token) {
      // Only show this action on spelling
      const spelling = context.diagnostics.filter(
        (diagnostic) => diagnostic.code === 'spelling'
      )
      if (spelling.length === 0) return
      const fix = new vscode.CodeAction(
        `Exclude ${get(spelling[0], '_word')} from the spell checker`,
        vscode.CodeActionKind.QuickFix
      )
      fix.command = {
        title: 'Exclude the word from the spell checker',
        command: 'markdown-wiki.excludeWord',
        arguments: [get(spelling[0], '_word')],
      }
      return [fix]
    },
  }

  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      { scheme: 'file', language: 'markdown' },
      provider,
      { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
    )
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'markdown-wiki.excludeWord',
      async (wordToExclude: string) => {
        const config = getConfig()
        const excludedWords: string[] = config.get(
          'excludedWords',
          []
        ) as string[]
        if (!excludedWords.includes(wordToExclude)) {
          excludedWords.push(wordToExclude)
          await config.update(
            'excludedWords',
            uniq(excludedWords).toSorted(),
            vscode.ConfigurationTarget.Workspace
          )
          vscode.window.showInformationMessage(
            `Added "${wordToExclude}" to excluded words!`
          )
          const editor = vscode.window.activeTextEditor
          if (editor) {
            await vscode.commands.executeCommand(`markdown-wiki.analyzeFile`)
          }
        }
      }
    )
  )
}
