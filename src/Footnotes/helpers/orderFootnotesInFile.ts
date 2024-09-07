import { execSync } from 'node:child_process'
import * as fs from 'node:fs'
import prettier from '@prettier/sync'
import * as vscode from 'vscode'
import { auditFootnotesInFile, endnoteRegex } from './auditFootnotesInFile'

export const orderFootnotesInFile = async (filePath: string) => {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    return
  }

  const { contents, diagnostics } = await auditFootnotesInFile(filePath)
  let frontmatter = ''
  if (contents.indexOf('---') === 0) {
    frontmatter = `${contents.slice(0, contents.indexOf('---', 4) + 4)}\n`
  }

  if (diagnostics.length >= 1) {
    return vscode.window.showErrorMessage(
      'You have missing or unmatched footnotes. Aborting operation.'
    )
  }
  const pandocExists = execSync('pandoc --help',  {"encoding": "utf-8"}).toString()
  if (pandocExists) { // TODO
    return vscode.window.showErrorMessage(
      'You must have pandoc installed to order footnotes and endnotes.'
    )
  }
  // Make sure the the first endnote is always at least two lines from the footnote
  // Otherwise, pandoc will glitch.
  fs.writeFileSync(filePath, contents.replace(endnoteRegex, '\n\n$1: $2'))
  // Pandoc will reorder the footnotes and endnotes automatically
  execSync(`pandoc -f markdown ${filePath} --wrap=none -o ${filePath}`)

  fs.writeFileSync(
    filePath,
    frontmatter + // Pandoc will strip frontmatter, so we need to add it back
      prettier // Prettier will make sure it looks good
        .format(String(fs.readFileSync(filePath)), {
          parser: 'markdown',
        })
        // Pandoc will escape the [[ unnecessarily
        .replaceAll('\\[\\[', '[[')
        .replaceAll('\\]\\]', ']]')
        // Pandoc will escape $ and ~, which I do not like
        .replaceAll('\\$', '$')
        .replaceAll('\\~', '~')
  )
  const selection = editor.selection.active
  console.log(selection.line)
  // Move the cursor back the original place.
  setTimeout(() => {
    editor.selections = [
      new vscode.Selection(
        new vscode.Position(selection.line, selection.character - 4),
        new vscode.Position(selection.line, selection.character - 4)
      ),
    ]
  }, 100)
}
