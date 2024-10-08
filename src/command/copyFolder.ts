import * as vscode from 'vscode';
import { getChatPromptFromText } from 'src/getChatPrompt.js';
import * as path from 'path';
import * as fs from 'fs-extra';

export const copyFolder = async (folderUri: vscode.Uri) => {
  try {
    const files = await getAllFiles(folderUri.fsPath);
    const fileContents = await Promise.all(files.map(async file => {
      const document = await vscode.workspace.openTextDocument(vscode.Uri.file(file));
      const text = document.getText();
      const languageId = document.languageId;
      const fileName = path.basename(file);
      return `\`\`\`${languageId}\n// File: ${fileName}\n${text}\n\`\`\``;
    }));

    const finalPrompt = fileContents.join('\n\n');

    await getChatPromptFromText(finalPrompt, {
      isWholeFile: true,
      copyToClipboard: true,
    });
  } catch (error) {
    console.error('Error copying folder:', error);
    vscode.window.showErrorMessage(`Failed to copy folder: ${error.message}`);
  }
}

const getAllFiles = async (dirPath: string, arrayOfFiles: string[] = []) => {
  const files = await fs.readdir(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if ((await fs.stat(fullPath)).isDirectory()) {
      await getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }
  return arrayOfFiles;
};
