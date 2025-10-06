import * as vscode from 'vscode'

import {copyToClipboard} from 'src/command/copyToClipboard.js'
import {extensionConfig} from 'src/Configuration.js'
import {outputChannel} from 'src/outputChannel.js'

export const activate = (context: vscode.ExtensionContext) => {
  const copyToClipboardDisposable = vscode.commands.registerCommand(`${Bun.env.npm_package_name}.copyToClipboard`, copyToClipboard)
  context.subscriptions.push(copyToClipboardDisposable)
  const configurationListener = extensionConfig.makeListener()
  context.subscriptions.push(configurationListener)
  if (context.extensionMode === vscode.ExtensionMode.Development) {
    outputChannel.appendLine(`${Bun.env.npm_package_name} extension activated with ${context.subscriptions.length} subscriptions`)
    outputChannel.show()
  }
}
