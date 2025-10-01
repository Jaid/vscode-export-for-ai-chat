import * as path from 'path'

import fs from 'fs-extra'
import * as vscode from 'vscode'

import {getChatPromptFromText} from 'src/getChatPrompt.js'

export const copyFolder = async (folderUri: vscode.Uri) => {
  try {
    const files = await getAllFiles(folderUri.fsPath)
    const fileContents = await Promise.all(files.map(async file => {
      const document = await vscode.workspace.openTextDocument(vscode.Uri.file(file))
      const text = document.getText()
      const {languageId} = document
      const fileName = path.basename(file)
      return `\`\`\`${languageId}\n// File: ${fileName}\n${text}\n\`\`\``
    }))
    const finalPrompt = fileContents.join('\n\n')
    await getChatPromptFromText(finalPrompt, {
      isWholeFile: true,
      copyToClipboard: true,
    })
  } catch (error) {
    console.error('Error copying folder:', error)
    vscode.window.showErrorMessage(`Failed to copy folder: ${error.message}`)
  }
}

const getAllFiles = async (folderPath: string, arrayOfFiles: Array<string> = []) => {
  const files = await fs.readdir(folderPath)
  for (const file of files) {
    const fullPath = path.join(folderPath, file)
    if ((await fs.stat(fullPath)).isDirectory()) {
      await getAllFiles(fullPath, arrayOfFiles)
    } else {
      arrayOfFiles.push(fullPath)
    }
  }
  return arrayOfFiles
}
