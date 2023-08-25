import prettier from '@prettier/sync'
import { execSync } from 'child_process'
import commandExists from 'command-exists'
import * as fs from 'fs'
import * as vscode from 'vscode'
import { auditFootnotesInFile } from './auditFootnotesInFile'

export const orderFootnotesInFile = async (filePath: string) => {
  const { contents, diagnostics } = await auditFootnotesInFile(filePath)
  let frontmatter = ''
  if (contents.indexOf('---') === 0) {
    frontmatter = contents.slice(0, contents.indexOf('---', 4) + 4) + '\n'
  }

  if (diagnostics.length >= 1) {
    return vscode.window.showErrorMessage(
      'You have missing or unmatched footnotes. Aborting operation.'
    )
  } else if (commandExists.sync('pandoc --help')) {
    return vscode.window.showErrorMessage(
      'You must have pandoc installed to order footnotes.'
    )
  } else {
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

    vscode.window.showInformationMessage('Footnotes ordered!')
  }
}
