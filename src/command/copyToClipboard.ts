import type {Context} from 'src/makeContext.js'
import type {Arrayable} from 'type-fest'

import {Tiktoken} from 'js-tiktoken/lite'
import o200k_base from 'js-tiktoken/ranks/o200k_base'
import * as lodash from 'lodash-es'
import * as vscode from 'vscode'

import {handlebars} from 'src/handlebars.js'
import {makeContext} from 'src/makeContext.js'
import {outputChannel} from 'src/outputChannel.js'
import {renderUserPrompt} from 'src/renderUserPrompt.js'

export const copyPromptToClipboard = async (prompt: string, context: Context) => {
  const writeClipboardPromise = vscode.env.clipboard.writeText(prompt)
  let tokens: number | undefined
  const config = vscode.workspace.getConfiguration('export-for-ai-chat')
  if (config.get<boolean>('countTokens')) {
    const tiktoken = new Tiktoken(o200k_base)
    tokens = tiktoken.encode(prompt).length
  }
  const logMessageTemplate = 'Copied {{#if (isMultiple items)}}{{items.length}} items {{/if}}for AI chat ({{#if tokens}}{{tokens}} tokens, {{/if}}{{prompt.length}} characters).'
  const render = handlebars.compile(logMessageTemplate)
  const logMessage = render({
    ...context,
    prompt,
    tokens,
  })
  await writeClipboardPromise
  outputChannel.appendLine(logMessage)
  const showNotifications = config.get<boolean>('showNotifications')
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

export const copyUriToClipboard = async (uri: Arrayable<vscode.Uri>) => {
  const uris = lodash.castArray(uri)
  const allFileUris: Array<vscode.Uri> = []
  for (const singleUri of uris) {
    const stat = await vscode.workspace.fs.stat(singleUri)
    if (stat.type === vscode.FileType.File) {
      allFileUris.push(singleUri)
    } else if (stat.type === vscode.FileType.Directory) {
      const files = await findFilesInDirectory(singleUri)
      allFileUris.push(...files)
    }
  }
  if (!allFileUris.length) {
    vscode.window.showWarningMessage('No files found')
    return
  }
  const items = allFileUris.map(fileUri => ({uri: fileUri}))
  const context = await makeContext(items)
  const prompt = await renderUserPrompt(context)
  await copyPromptToClipboard(prompt, context)
}

export const copyToClipboard = async (uri?: vscode.Uri, selectedUris?: Array<vscode.Uri>) => {
  const selectedUri = selectedUris?.length ? selectedUris : uri
  if (!selectedUri) {
    await copyEditorToClipboard()
    return
  }
  await copyUriToClipboard(selectedUri)
}
