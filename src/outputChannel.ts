import * as vscode from 'vscode'

export const outputChannel = vscode.window.createOutputChannel(Bun.env.npm_package_display_name!)
