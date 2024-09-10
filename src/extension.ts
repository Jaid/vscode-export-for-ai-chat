import * as vscode from 'vscode'

import {copyCode} from './command/copyCode.js'
import {copyFile} from './command/copyFile.js'

export const activate = (context: vscode.ExtensionContext) => {
  const copyCodeDisposable = vscode.commands.registerCommand(`export-for-ai-chat.copyCode`, copyCode)
  const copyFileDisposable = vscode.commands.registerCommand(`export-for-ai-chat.copyFile`, copyFile)
  context.subscriptions.push(copyCodeDisposable, copyFileDisposable)
}
