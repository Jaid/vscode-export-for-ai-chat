import type * as vscode from 'vscode'

import {getChatPromptFromEditor} from '../getChatPrompt.js'

export const copyCode = async (contextFile?: vscode.Uri) => {
  if (!contextFile) {
    await getChatPromptFromEditor()
  }
  // TODO Implement editor tab searching by contextFile
  await getChatPromptFromEditor()
}
