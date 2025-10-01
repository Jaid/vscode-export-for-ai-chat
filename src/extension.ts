import * as vscode from 'vscode'

import {copyCode} from 'src/command/copyCode.js'
import {copyFile} from 'src/command/copyFile.js'
import {copyFolder} from 'src/command/copyFolder.js'
import {outputChannel} from 'src/outputChannel.js'

export const activate = (context: vscode.ExtensionContext) => {
  outputChannel.appendLine('Starting Export for AI Chat extension activation.')
  const copyCodeDisposable = vscode.commands.registerCommand('export-for-ai-chat.copyCode', copyCode)
  const copyFileDisposable = vscode.commands.registerCommand('export-for-ai-chat.copyFile', copyFile)
  const copyFolderDisposable = vscode.commands.registerCommand('export-for-ai-chat.copyFolder', copyFolder)
  context.subscriptions.push(copyCodeDisposable, copyFileDisposable, copyFolderDisposable)
  outputChannel.appendLine('Export for AI Chat extension activated.')
}
