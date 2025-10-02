import type * as vscode from 'vscode'

import {copyUriToClipboard} from 'src/copyToClipboard.js'

export const copyFolder = async (folderUri: vscode.Uri) => {
  await copyUriToClipboard(folderUri)
}
