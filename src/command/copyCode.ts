import * as vscode from 'vscode'

import {getChatPromptFromEditor, getChatPromptFromText} from '../getChatPrompt.js'

export const copyCode = async (contextFile?: vscode.Uri) => {
  if (!contextFile) {
    await getChatPromptFromEditor()
    return
  }
  const matchingDocument = vscode.workspace.textDocuments.find(document => document.uri === contextFile)
  if (!matchingDocument) {
    await getChatPromptFromEditor()
    return
  }
  await getChatPromptFromText(matchingDocument.getText())
}
