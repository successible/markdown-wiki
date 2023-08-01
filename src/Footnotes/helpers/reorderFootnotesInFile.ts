import * as fs from 'fs'
import parserMarkdown from 'prettier/parser-markdown'
import prettier from 'prettier/standalone'
import * as vscode from 'vscode'
import { generateFootnoteText } from './generateFootnoteText'
import { parseFileForFootnotes } from './parseFileForFootnotes'

export const footnoteRegex = /(\[\^\w+\])(?!(: ))/g
export const endnoteRegex = /(\[\^\w+\]): (.*)/g

export const reorderFootnotesInFile = async () => {
  const editor = vscode.window.activeTextEditor
  if (editor) {
    const file = editor.document.fileName // The path of the file
    const response = parseFileForFootnotes(file)
    if (!response) {
      return
    } else {
      const { contents, footnotes, urls } = response
      let newContents = contents
      const mapper: Record<string, number> = {}
      const urlMapper: Record<string, string> = {}
      footnotes.forEach((footnote, index) => {
        // By looping through each footnote in a file in the order of appearance we can reorder the footnotes.
        // However, we must replacement each number with a random identifier first.
        // Otherwise, when you go to replace [^6] with [^1], latter in the loop
        // You're going to run into problems
        const replacement = generateFootnoteText()
        mapper[replacement] = index + 1
        urlMapper[replacement] = urls[footnote]
        newContents = newContents.replaceAll(footnote, replacement)
        // Here we replace all the endnotes
        newContents = newContents.replace(endnoteRegex, '')
      })

      // Here we create a new set of endnotes, using the ordering of the footnotes.
      Object.keys(urlMapper).forEach((placeholder) => {
        const url = urlMapper[placeholder]
        newContents = newContents += `\n${placeholder}: ${url}`
      })

      // Here we actually replacement the placeholder (e.g. [^1212va])
      // In the footnote and the endnote with the value (e.g. [^1])
      Object.keys(mapper).forEach((placeholder) => {
        const index = mapper[placeholder]
        newContents = newContents.replaceAll(placeholder, `[^${index}]`)
      })

      // Finally, we format the contents and overwrite the old file
      const formattedNewContents = await prettier.format(newContents, {
        parser: 'markdown',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        plugins: [parserMarkdown as any],
      })
      fs.writeFileSync(file, formattedNewContents)
      vscode.window.showInformationMessage('Footnotes reordered!')
    }
  }
}
