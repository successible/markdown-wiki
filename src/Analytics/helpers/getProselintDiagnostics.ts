import { execSync } from 'node:child_process'
import shelljs from 'shelljs'
import * as vscode from 'vscode'
import { info } from '..'

// Hide the output of the Proselint command
// You can always log it in the callback as needed
shelljs.config.silent = true

// These codes are cosmetic and tend not to play well with Markdown

type ProseLintError = {
  check: string
  message: string
  column: number
  end: number
  extent: number
  line: number
}

const proseLintCodesToIgnore = [
  'annotations.misc',
  'dates_times.dates',
  'leonard.exclamation.30ppm',
  'misc.but',
  'typography.symbols.curly_quotes',
  'typography.symbols.multiplication_symbol',
]

export const getProselintDiagnostics = async (
  document: vscode.TextDocument
): Promise<vscode.Diagnostic[]> => {
  const codeBlockLines: number[] = []
  const footnoteLines: number[] = []

  let inCodeBlock = false

  for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
    const paragraph = document.lineAt(lineIndex)
    if (paragraph.text.startsWith('[^')) {
      footnoteLines.push(lineIndex)
    }
    if (paragraph.text.startsWith('```')) {
      inCodeBlock = !inCodeBlock
    }
    if (inCodeBlock) {
      codeBlockLines.push(lineIndex)
    }
  }

  const proselintExists = execSync('proselint --help', {"encoding": "utf-8"}).toString().includes("proselint [OPTIONS] [PATHS]")
  // Lint the entire document using proselint
  if (proselintExists) {
    // We need to wrap shelljs.exec in a Promise. That way, the getProselintDiagnostics function
    // Waits until diagnostics is full, then returns it. Otherwise, the function will return
    // An empty array while Proselint is still running.
    const proselintPromise = new Promise<vscode.Diagnostic[]>(
      (resolve, reject) => {
        const diagnostics: vscode.Diagnostic[] = []
        shelljs.exec(
          `proselint --json "${document.fileName}"`,
          (code, output, error) => {
            if (error) {
              reject(error)
            }
            const proselint = JSON.parse(output) as {
              data: {
                errors: [ProseLintError]
              }
            }
            const { data } = proselint
            for (const error of data.errors) {
              const { check, line, message } = error
              // Do not run Proselint on a footnote or codeblock
              if (
                !proseLintCodesToIgnore.includes(check) &&
                !footnoteLines.includes(line) &&
                !codeBlockLines.includes(line)
              ) {
                const range = document.lineAt(line - 1).range
                const severity = info
                const diagnostic = new vscode.Diagnostic(
                  range,
                  message,
                  severity
                )
                diagnostic.code = 'proselint'
                diagnostics.push(diagnostic)
              }
            }
            resolve(diagnostics)
          }
        )
      }
    )
    const diagnostics = await proselintPromise
    return diagnostics
  }
  return [] as vscode.Diagnostic[]
}
