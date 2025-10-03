import type * as vscode from 'vscode'

import {copyUriToClipboard} from 'src/copyToClipboard.js'

export const copyFile = async (uri: vscode.Uri, selectedUris: Array<vscode.Uri>) => {
  await copyUriToClipboard(selectedUris.length ? selectedUris : uri)
}
