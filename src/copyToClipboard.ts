import type {Context} from 'src/makeContext.js'

import * as vscode from 'vscode'
import {renderHandlebars} from 'zeug'

import {makeContext} from 'src/makeContext.js'
import {outputChannel} from 'src/outputChannel.js'
import {renderUserPrompt} from 'src/renderUserPrompt.js'

export const copyPromptToClipboard = async (prompt: string, context: Context) => {
  await vscode.env.clipboard.writeText(prompt)
  const logMessageTemplate = 'Copied {{#if isMultiple items}}{{items.length}} items {{#else}}{{/if}}for AI chat ({{prompt.length}} total characters).'
  const logMessage = renderHandlebars(logMessageTemplate, {
    ...context,
    prompt,
  })
  const config = vscode.workspace.getConfiguration('export-for-ai-chat')
  const showNotifications = config.get<boolean>('showNotifications')
  outputChannel.appendLine(logMessage)
  if (showNotifications) {
    vscode.window.showInformationMessage(logMessage)
  }
}

export const copyEditorToClipboard = async (editor?: vscode.TextEditor) => {
  const selectedEditor = editor ?? vscode.window.activeTextEditor
  if (!selectedEditor) {
    vscode.window.showErrorMessage('No active editor found')
    return
  }
  const item = {editor: selectedEditor}
  const context = await makeContext(item)
  const prompt = await renderUserPrompt(context)
  await copyPromptToClipboard(prompt, context)
}

const findFilesInDirectory = async (directoryUri: vscode.Uri): Promise<Array<vscode.Uri>> => {
  const files: Array<vscode.Uri> = []
  const excludePatterns = new Set([
    'node_modules',
    '.git',
    '.vscode',
    'out',
    'dist',
    'build',
    '.next',
    '.nuxt',
    'coverage',
    '.cache',
    '.temp',
    '.tmp',
  ])
  const processDirectory = async (uri: vscode.Uri) => {
    const entries = await vscode.workspace.fs.readDirectory(uri)
    for (const [name, type] of entries) {
      if (excludePatterns.has(name)) {
        continue
      }
      const childUri = vscode.Uri.joinPath(uri, name)
      if (type === vscode.FileType.File) {
        if (
          name.endsWith('.png')
          || name.endsWith('.jpg')
          || name.endsWith('.jpeg')
          || name.endsWith('.gif')
          || name.endsWith('.ico')
          || name.endsWith('.svg')
          || name.endsWith('.woff')
          || name.endsWith('.woff2')
          || name.endsWith('.ttf')
          || name.endsWith('.eot')
          || name.endsWith('.mp4')
          || name.endsWith('.mp3')
          || name.endsWith('.pdf')
          || name.endsWith('.zip')
          || name.endsWith('.tar')
          || name.endsWith('.gz')
        ) {
          continue
        }
        files.push(childUri)
      } else if (type === vscode.FileType.Directory) {
        await processDirectory(childUri)
      }
    }
  }
  await processDirectory(directoryUri)
  return files
}

export const copyUriToClipboard = async (uri: vscode.Uri) => {
  const stat = await vscode.workspace.fs.stat(uri)
  if (stat.type === vscode.FileType.File) {
    const context = await makeContext({uri})
    const prompt = await renderUserPrompt(context)
    await copyPromptToClipboard(prompt, context)
    return
  }
  if (stat.type === vscode.FileType.Directory) {
    const files = await findFilesInDirectory(uri)
    if (!files.length) {
      vscode.window.showWarningMessage('No files found in the selected folder')
      return
    }
    const items = files.map(fileUri => ({uri: fileUri}))
    const context = await makeContext(items)
    const prompt = await renderUserPrompt(context)
    await copyPromptToClipboard(prompt, context)
    return
  }
  vscode.window.showErrorMessage('Invalid file or folder')
}
