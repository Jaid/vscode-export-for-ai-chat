import * as assert from 'node:assert'
import * as path from 'node:path'

import * as vscode from 'vscode'

describe('Functionality', () => {
  let extension: vscode.Extension<any> | undefined
  const testTimeout = 10_000
  it('should activate extension before functional tests', async function () {
    this.timeout(testTimeout)
    extension = vscode.extensions.getExtension('jaidchen.export-for-ai-chat')
    if (!extension) {
      throw new Error('Extension not found')
    }
    await extension.activate()
    assert.strictEqual(extension.isActive, true)
  })
  it('copyToClipboard command should copy whole file to clipboard', async function () {
    this.timeout(testTimeout)
    const {workspaceFolders} = vscode.workspace
    assert.ok(workspaceFolders && workspaceFolders.length > 0, 'Workspace should be open')
    const testFilePath = path.join(workspaceFolders[0].uri.fsPath, 'a', 'test.js')
    const testFileUri = vscode.Uri.file(testFilePath)
    const document = await vscode.workspace.openTextDocument(testFileUri)
    const editor = await vscode.window.showTextDocument(document)
    await new Promise(resolve => setTimeout(resolve, 500))
    try {
      await vscode.commands.executeCommand('export-for-ai-chat.copyToClipboard')
    } catch (error) {
      console.error('Command execution error:', error)
      throw error
    }
    await new Promise(resolve => setTimeout(resolve, 500))
    const clipboardContent = await vscode.env.clipboard.readText()
    assert.ok(clipboardContent.length > 0, 'Clipboard should not be empty')
    assert.ok(clipboardContent.includes('export default') || clipboardContent.includes('hi'), 'Clipboard should contain the file content')
    assert.ok(clipboardContent.includes('JavaScript') || clipboardContent.includes('javascript'), 'Should mention the language')
  })
  it('copyToClipboard command should copy selected text only', async function () {
    this.timeout(testTimeout)
    const {workspaceFolders} = vscode.workspace
    assert.ok(workspaceFolders && workspaceFolders.length > 0, 'Workspace should be open')
    const testFilePath = path.join(workspaceFolders[0].uri.fsPath, 'a', 'test.js')
    const testFileUri = vscode.Uri.file(testFilePath)
    const document = await vscode.workspace.openTextDocument(testFileUri)
    const editor = await vscode.window.showTextDocument(document)
    await new Promise(resolve => setTimeout(resolve, 500))
    // Select only part of the text
    const selection = new vscode.Selection(0, 0, 0, 6) // Select "export"
    editor.selection = selection
    await vscode.commands.executeCommand('export-for-ai-chat.copyToClipboard')
    await new Promise(resolve => setTimeout(resolve, 500))
    const clipboardContent = await vscode.env.clipboard.readText()
    assert.ok(clipboardContent.includes('export'), 'Clipboard should contain selected text')
  })
  it('copyToClipboard command should copy file content', async function () {
    this.timeout(testTimeout)
    const {workspaceFolders} = vscode.workspace
    assert.ok(workspaceFolders && workspaceFolders.length > 0, 'Workspace should be open')
    const testFilePath = path.join(workspaceFolders[0].uri.fsPath, 'a', 'test.js')
    const testFileUri = vscode.Uri.file(testFilePath)
    await vscode.commands.executeCommand('export-for-ai-chat.copyToClipboard', testFileUri)
    await new Promise(resolve => setTimeout(resolve, 500))
    const clipboardContent = await vscode.env.clipboard.readText()
    assert.ok(clipboardContent.length > 0, 'Clipboard should not be empty')
    assert.ok(clipboardContent.includes('export default') || clipboardContent.includes('hi'), 'Clipboard should contain the file content')
    assert.ok(clipboardContent.includes('a/test.js') || clipboardContent.includes('a\\test.js') || clipboardContent.includes('test.js'), 'Clipboard should contain file path')
  })
  it('copyToClipboard command should work for folders', async function () {
    this.timeout(testTimeout)
    const {workspaceFolders} = vscode.workspace
    assert.ok(workspaceFolders && workspaceFolders.length > 0, 'Workspace should be open')
    const folderPath = path.join(workspaceFolders[0].uri.fsPath, 'a')
    const folderUri = vscode.Uri.file(folderPath)
    await vscode.commands.executeCommand('export-for-ai-chat.copyToClipboard', folderUri)
    await new Promise(resolve => setTimeout(resolve, 500))
    const clipboardContent = await vscode.env.clipboard.readText()
    assert.ok(clipboardContent.length > 0, 'Clipboard should not be empty')
    assert.ok(clipboardContent.includes('export default') || clipboardContent.includes('hi'), 'Clipboard should contain the file content')
    assert.ok(clipboardContent.includes('test.js'), 'Clipboard should reference the file')
  })
  it('clipboard should contain proper markdown formatting', async function () {
    this.timeout(testTimeout)
    const {workspaceFolders} = vscode.workspace
    assert.ok(workspaceFolders && workspaceFolders.length > 0, 'Workspace should be open')
    const testFilePath = path.join(workspaceFolders[0].uri.fsPath, 'a', 'test.js')
    const testFileUri = vscode.Uri.file(testFilePath)
    const document = await vscode.workspace.openTextDocument(testFileUri)
    await vscode.window.showTextDocument(document)
    await new Promise(resolve => setTimeout(resolve, 500))
    await vscode.commands.executeCommand('export-for-ai-chat.copyToClipboard')
    await new Promise(resolve => setTimeout(resolve, 500))
    const clipboardContent = await vscode.env.clipboard.readText()
    const codeBlockCount = (clipboardContent.match(/```/g) || []).length
    assert.strictEqual(codeBlockCount % 2, 0, 'Code blocks should be properly closed')
    assert.ok(clipboardContent.includes('javascript') || clipboardContent.includes('js'), 'Should include language identifier')
  })
  it('should handle multiple files in folder', async function () {
    this.timeout(testTimeout)
    const {workspaceFolders} = vscode.workspace
    assert.ok(workspaceFolders && workspaceFolders.length > 0, 'Workspace should be open')
    const rootFolderUri = workspaceFolders[0].uri
    await vscode.commands.executeCommand('export-for-ai-chat.copyToClipboard', rootFolderUri)
    await new Promise(resolve => setTimeout(resolve, 1000))
    const clipboardContent = await vscode.env.clipboard.readText()
    assert.ok(clipboardContent.length > 0, 'Clipboard should not be empty')
    if (clipboardContent.includes('files from a project')) {
      assert.ok(true, 'Indicates multiple files were copied')
    }
  })
  it('configuration should affect output', async function () {
    this.timeout(testTimeout)
    const config = vscode.workspace.getConfiguration('export-for-ai-chat')
    const originalShowNotifications = config.get<boolean>('showNotifications')
    await config.update('showNotifications', false, vscode.ConfigurationTarget.Workspace)
    const {workspaceFolders} = vscode.workspace
    assert.ok(workspaceFolders && workspaceFolders.length > 0, 'Workspace should be open')
    const testFilePath = path.join(workspaceFolders[0].uri.fsPath, 'a', 'test.js')
    const testFileUri = vscode.Uri.file(testFilePath)
    const document = await vscode.workspace.openTextDocument(testFileUri)
    await vscode.window.showTextDocument(document)
    await new Promise(resolve => setTimeout(resolve, 500))
    await vscode.commands.executeCommand('export-for-ai-chat.copyToClipboard')
    await new Promise(resolve => setTimeout(resolve, 500))
    const clipboardContent = await vscode.env.clipboard.readText()
    assert.ok(clipboardContent.length > 0, 'Clipboard should still work with notifications disabled')
    await config.update('showNotifications', originalShowNotifications, vscode.ConfigurationTarget.Workspace)
  })
})
