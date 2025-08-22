// Link: https://github.com/houkanshan/vscode-markdown-footnote

// MIT License

// Copyright (c) 2020 Mai Hou

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import * as vscode from 'vscode'
import { Position } from 'vscode'

export const footnoteRefRegex = /\[\^(?<key>\S+?)\](?!:)/g
export const footnoteContentRegex = /^\[\^(?<key>\S+?)\](?=: +)/gm

export type GotoLineColumnArgs = { line: number; column: number }

export function internalGotoLineColumn(
  editor: vscode.TextEditor,
  { line, column }: GotoLineColumnArgs
) {
  const position = new Position(line, column)
  const range = new vscode.Range(position, new Position(line, column + 1))
  editor.selection = new vscode.Selection(range.start, range.end)
  editor.revealRange(range)
}

const escapeForRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function buildFootnoteContentRegex(name: string) {
  return new RegExp(
    `^\\[\\^(?<key>${escapeForRegExp(name)})\\]\\: +(?<content>.*)$`,
    'm'
  )
}

export default class FootnoteHover implements vscode.HoverProvider {
  public provideHover(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    const footnoteRefHover = this.footnoteRefHoverProvider(document, position)
    if (footnoteRefHover) {
      return footnoteRefHover
    }

    const footnoteContentHover = this.footnoteContentHoverProvider(
      document,
      position
    )
    if (footnoteContentHover) {
      return footnoteContentHover
    }

    return null
  }

  private footnoteRefHoverProvider(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    const range = document.getWordRangeAtPosition(position, footnoteRefRegex)
    if (!range) {
      return null
    }

    const footnoteRefText = document.getText(range)
    const footnoteName = footnoteRefText.slice(2, footnoteRefText.length - 1)

    const contentRegex = buildFootnoteContentRegex(footnoteName)
    const match = document.getText().match(contentRegex)

    if (!match) {
      return null
    }

    // biome-ignore lint/style/noNonNullAssertion: Used by original author
    const content = `${match.groups!.content}`
    return new vscode.Hover(wrapMarkdownString(`${content}`), range)
  }

  private footnoteContentHoverProvider(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    const range = document.getWordRangeAtPosition(
      position,
      footnoteContentRegex
    )
    if (!range) {
      return null
    }

    return new vscode.Hover(wrapMarkdownString(''), range)
  }
}

function wrapMarkdownString(content: string) {
  var mdStr = new vscode.MarkdownString(content)
  mdStr.isTrusted = true
  return mdStr
}
