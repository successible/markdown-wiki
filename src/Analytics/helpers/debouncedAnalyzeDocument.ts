import pDebounce from 'p-debounce'
import type * as vscode from 'vscode'
import { analyzeDocument, type DocumentMode } from './analyzeDocument'

export const debouncedAnalyzeDocument = pDebounce(
  async (
    context: vscode.ExtensionContext,
    document: vscode.TextDocument,
    analytics: vscode.DiagnosticCollection,
    mode: DocumentMode
  ) => {
    const { diagnostics } = await analyzeDocument(context, document, mode)
    analytics.set([[document.uri, diagnostics]])
    return diagnostics
  },
  300
)
