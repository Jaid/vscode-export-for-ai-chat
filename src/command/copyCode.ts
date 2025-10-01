import * as vscode from 'vscode'

import {getChatPromptFromEditor} from '../getChatPrompt.js'

export const copyCode = async () => {
  await getChatPromptFromEditor()
}
