import * as fs from 'fs'
import { customAlphabet } from 'nanoid'
import prettier from 'prettier'
import { difference } from 'set-operations'
import * as vscode from 'vscode'
import glob from 'glob'
import { isWebUri } from 'valid-url'

const footnoteRegex = /(\[\^\w+\])(?!(: ))/g
const endnoteRegex = /(\[\^\w+\]): (.*)/g

export const parseMarkdownFile = (file: string) => {
  // Using regex to parse the footnotes and the endnotes
  // Look for missing footnotes and endnotes.

  const contents = String(fs.readFileSync(file))
  const footnotes = []
  for (const match of contents.matchAll(footnoteRegex)) {
    const footnote = match[1]
    footnotes.push(footnote)
  }

  const endnotes = []
  const urls: Record<string, string> = {}
  for (const match of contents.matchAll(endnoteRegex)) {
    const endnote = match[1]
    const url = match[2]
    endnotes.push(endnote)
    urls[endnote] = url
  }

  const missingFootnotes = difference(footnotes, endnotes)
  if (missingFootnotes.size > 0) {
    const message = 'Unmatched endnotes'
    const error = `${message}: ${Array.from(missingFootnotes).join(' ')}`
    vscode.window.showErrorMessage(error)
    return null
  }

  const missingEndnotes = difference(endnotes, footnotes)
  if (missingEndnotes.size > 0) {
    const message = 'Unmatched footnotes'
    const error = `${message}: ${Array.from(missingEndnotes).join(' ')}`
    vscode.window.showErrorMessage(error)
    return null
  }

  return { contents, footnotes, endnotes, urls }
}

export const generateFootnote = () => {
  const nanoid = customAlphabet('1234567890abcdef', 10)
  const replacement = `[^${nanoid(6)}]`
  return replacement
}

export const reorderFootnotes = (
  file: string,
  contents: string,
  footnotes: string[],
  urls: Record<string, string>
) => {
  let newContents = contents
  const mapper: Record<string, number> = {}
  const urlMapper: Record<string, string> = {}
  footnotes.forEach((footnote, index) => {
    // By looping through each footnote in a file in the order of appearance we can reorder the footnotes.
    // However, we must replacement each number with a random identifier first.
    // Otherwise, when you go to replace [^6] with [^1], latter in the loop
    // You're going to run into problems
    const replacement = generateFootnote()
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
  fs.writeFileSync(file, prettier.format(newContents, { parser: 'markdown' }))
  vscode.window.showInformationMessage('Footnotes reordered and formatted!')
}

export const reorderFootnotesInFile = async () => {
  const editor = vscode.window.activeTextEditor
  if (editor) {
    const file = editor.document.fileName // The path of the file
    const response = parseMarkdownFile(file)
    if (!response) {
      return
    } else {
      const { contents, footnotes, urls } = response
      reorderFootnotes(file, contents, footnotes, urls)
    }
  }
}

export const reorderFootnotesInWorkspace = async () => {
  if (vscode.workspace.workspaceFolders) {
    const workspace = vscode.workspace.workspaceFolders[0]
    // We run parseFile first to ensure no missing footnotes or endnotes.
    glob(`${workspace.uri.path}/**/*.md`, {}, (error, files) => {
      files.forEach((file) => {
        parseMarkdownFile(file)
      })
    })
    // Then, we run it again and actually use the results to manipulate the filesystem
    glob(`${workspace.uri.path}/**/*.md`, {}, (error, files) => {
      files.forEach((file) => {
        const response = parseMarkdownFile(file)
        if (!response) {
          return
        } else {
          const { contents, footnotes, urls } = response
          reorderFootnotes(file, contents, footnotes, urls)
        }
      })
    })
    vscode.window.showInformationMessage(
      `Footnotes in the workspace ${workspace.name} reordered and formatted!`
    )
  }
}

export const insertFootnote = async () => {
  const editor = vscode.window.activeTextEditor
  if (editor) {
    const url = await vscode.env.clipboard.readText()
    if (!isWebUri(url)) {
      const message = 'You must have a link copied to your clipboard!'
      return vscode.window.showErrorMessage(message)
    }
    const selection = editor.selection.active
    const cursor = editor.document.offsetAt(selection)
    if (cursor === 0) {
      const message = 'You must have your cursor in the document'
      return vscode.window.showErrorMessage(message)
    }

    const edit = new vscode.WorkspaceEdit()
    const replacement = generateFootnote()
    edit.insert(editor.document.uri, selection, replacement)
    edit.insert(
      editor.document.uri,
      new vscode.Position(editor.document.lineCount, 0),
      `${replacement}: ${url}`
    )

    await vscode.workspace.applyEdit(edit)
    await editor.document.save()
    reorderFootnotesInFile()
  }
}
