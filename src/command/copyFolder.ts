import * as path from 'path'

import fs from 'fs-extra'
import * as vscode from 'vscode'

import {copyPromptToClipboard} from '../getChatPrompt.js'
import {type Context, renderPrompt} from '../renderPrompt.js'

const getAllFiles = async (folderPath: string, arrayOfFiles: Array<string> = []) => {
  const files = await fs.readdir(folderPath)
  for (const file of files) {
    const fullPath = path.join(folderPath, file)
    const stat = await fs.stat(fullPath)
    if (stat.isDirectory()) {
      await getAllFiles(fullPath, arrayOfFiles)
    } else {
      arrayOfFiles.push(fullPath)
    }
  }
  return arrayOfFiles
}

export const copyFolder = async (folderUri: vscode.Uri) => {
  try {
    const files = await getAllFiles(folderUri.fsPath)
    const fileUris = files.map(file => vscode.Uri.file(file))
    const prompt = await renderPrompt(fileUris.map(uri => ({uri})))
    const {workspaceFolders} = vscode.workspace
    const workspaceFolder = workspaceFolders?.[0]
    const workspaceName = workspaceFolder?.name ?? 'Unknown'
    const items = await Promise.all(fileUris.map(async uri => {
      const document = await vscode.workspace.openTextDocument(uri)
      return {
        code: document.getText(),
        file: uri.fsPath,
        fileName: uri.path.split('/').pop(),
        fileRelative: workspaceFolder ? vscode.workspace.asRelativePath(uri, false) : undefined,
        isWholeFile: true,
        languageId: document.languageId,
      }
    }))
    const context: Context = {
      blankLine: '\n\n',
      codeCloser: '`' + '`' + '`',
      codeOpener: '`' + '`' + '`',
      hasMultiple: items.length > 1,
      items,
      newline: '\n',
      workspaceFolder: workspaceFolder?.uri.fsPath,
      workspaceFolderName: workspaceFolder?.name,
      workspaceName,
    }
    await copyPromptToClipboard(prompt, context)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error copying folder:', error)
    vscode.window.showErrorMessage(`Failed to copy folder: ${errorMessage}`)
  }
}
