import * as vscode from 'vscode'

import {copyCode} from './command/copyCode.js'
import {copyFile} from './command/copyFile.js'
import {copyFolder} from './command/copyFolder.js'

export const activate = (context: vscode.ExtensionContext) => {
  const copyCodeDisposable = vscode.commands.registerCommand('export-for-ai-chat.copyCode', copyCode)
  const copyFileDisposable = vscode.commands.registerCommand('export-for-ai-chat.copyFile', copyFile)
  const copyFolderDisposable = vscode.commands.registerCommand('export-for-ai-chat.copyFolder', copyFolder)
  context.subscriptions.push(copyCodeDisposable, copyFileDisposable, copyFolderDisposable)
}
