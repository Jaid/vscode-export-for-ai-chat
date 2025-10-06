import type {Context} from 'src/makeContext.js'
import type {Arrayable} from 'type-fest'

import {Tiktoken} from 'js-tiktoken/lite'
import o200k_base from 'js-tiktoken/ranks/o200k_base'
import * as lodash from 'lodash-es'
import * as vscode from 'vscode'

import {handlebars} from 'lib/handlebars.ts'
import {extensionConfig} from 'src/Configuration.js'
import {makeContext} from 'src/makeContext.js'
import {outputChannel} from 'src/outputChannel.ts'
import {renderUserPrompt} from 'src/renderUserPrompt.js'

export const copyPromptToClipboard = async (prompt: string, context: Context) => {
  const startTime = performance.now()
  const writeClipboardPromise = vscode.env.clipboard.writeText(prompt)
  let tokens: number | undefined
  if (extensionConfig.countTokens) {
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
  const endTime = performance.now()
  outputChannel.appendLine(`Done in ${(endTime - startTime).toFixed(1)} ms: ${logMessage}`)
  if (extensionConfig.showNotifications) {
    const showNotification = async () => {
      const selection = await vscode.window.showInformationMessage(logMessage, 'Okay', 'Open', 'Don’t show again')
      if (selection === 'Open') {
        const newDocument = await vscode.workspace.openTextDocument({
          content: prompt,
          language: 'markdown',
        })
        await vscode.window.showTextDocument(newDocument, {preview: false})
      }
      if (selection === 'Don’t show again') {
        extensionConfig.showNotifications = false
      }
    }
    showNotification()
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

type FindFilesResult = {
  excluded: Array<vscode.Uri>
  included: Array<vscode.Uri>
}
const findFilesInDirectory = async (directoryUri: vscode.Uri): Promise<FindFilesResult> => {
  const includedFiles: Array<vscode.Uri> = []
  const excludedFiles: Array<vscode.Uri> = []
  const shouldExclude = (uri: vscode.Uri, isFile: boolean, isFolder: boolean) => {
    return extensionConfig.blacklistExpression({
      fullPath: uri.fsPath,
      isFile,
      isFolder,
    })
  }
  const processDirectory = async (uri: vscode.Uri) => {
    const entries = await vscode.workspace.fs.readDirectory(uri)
    for (const [name, type] of entries) {
      const childUri = vscode.Uri.joinPath(uri, name)
      const isFile = type === vscode.FileType.File
      const isFolder = type === vscode.FileType.Directory
      if (shouldExclude(childUri, isFile, isFolder)) {
        excludedFiles.push(childUri)
        continue
      }
      if (isFile) {
        includedFiles.push(childUri)
      } else if (isFolder) {
        await processDirectory(childUri)
      }
    }
  }
  await processDirectory(directoryUri)
  return {
    included: includedFiles,
    excluded: excludedFiles,
  }
}

export const copyUriToClipboard = async (uri: Arrayable<vscode.Uri>) => {
  const startTime = performance.now()
  const uris = lodash.castArray(uri)
  const allFileUris: Array<vscode.Uri> = []
  let excludedCount = 0
  for (const singleUri of uris) {
    const stat = await vscode.workspace.fs.stat(singleUri)
    if (stat.type === vscode.FileType.File) {
      allFileUris.push(singleUri)
    } else if (stat.type === vscode.FileType.Directory) {
      const files = await findFilesInDirectory(singleUri)
      allFileUris.push(...files.included)
      excludedCount += files.excluded.length
    }
  }
  if (!allFileUris.length) {
    vscode.window.showWarningMessage('No files found')
    return
  }
  const totalFiles = allFileUris.length + excludedCount
  const endTime = performance.now()
  outputChannel.appendLine(`Selected ${allFileUris.length}/${totalFiles} traversed files in ${(endTime - startTime).toFixed(1)} ms`)
  const items = allFileUris.map(fileUri => ({uri: fileUri}))
  const context = await makeContext(items)
  const prompt = await renderUserPrompt(context)
  await copyPromptToClipboard(prompt, context)
}

type CommandArgs = [
  undefined,
  undefined,
] | [
  uri: vscode.TextEditor,
  undefined,
] | [
  uri: vscode.Uri,
  selectedUris: Array<vscode.Uri>,
] | [
  uri: vscode.Uri,
  undefined,
]

export const copyToClipboard = async (...args: CommandArgs) => {
  const [uri, selectedUris] = args
  if (!uri) {
    await copyEditorToClipboard()
    return
  }
  if ('document' in uri) {
    await copyEditorToClipboard(uri)
    return
  }
  const selectedUri = selectedUris?.length ? selectedUris : uri
  await copyUriToClipboard(selectedUri)
}
