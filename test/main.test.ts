import * as assert from 'node:assert'
import * as path from 'node:path'

import {after, before, describe, it} from 'mocha'
import * as vscode from 'vscode'

describe('Extension Test Suite', () => {
  before(() => {
    vscode.window.showInformationMessage('Starting extension tests...')
  })
  after(() => {
    vscode.window.showInformationMessage('All tests completed!')
  })
  it('Extension should be present', () => {
    const extension = vscode.extensions.getExtension('jaidchen.export-for-ai-chat')
    assert.ok(extension, 'Extension should be installed')
  })
  it('Extension should activate', async () => {
    const extension = vscode.extensions.getExtension('jaidchen.export-for-ai-chat')
    if (!extension) {
      throw new Error('Extension not found')
    }
    await extension.activate()
    assert.strictEqual(extension.isActive, true, 'Extension should be active')
  })
  it('Should register copyCode command', async () => {
    const commands = await vscode.commands.getCommands(true)
    assert.ok(commands.includes('export-for-ai-chat.copyCode'), 'copyCode command should be registered')
  })
  it('Should register copyFile command', async () => {
    const commands = await vscode.commands.getCommands(true)
    assert.ok(commands.includes('export-for-ai-chat.copyFile'), 'copyFile command should be registered')
  })
  it('Should register copyFolder command', async () => {
    const commands = await vscode.commands.getCommands(true)
    assert.ok(commands.includes('export-for-ai-chat.copyFolder'), 'copyFolder command should be registered')
  })
  it('Should copy file content to clipboard', async function () {
    this.timeout(10_000)
    // Open the test file
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]
    assert.ok(workspaceFolder, 'Workspace folder should be available')
    const testFilePath = path.join(workspaceFolder.uri.fsPath, 'a', 'test.js')
    const testFileUri = vscode.Uri.file(testFilePath)
    const document = await vscode.workspace.openTextDocument(testFileUri)
    await vscode.window.showTextDocument(document)
    // Execute the copyFile command
    await vscode.commands.executeCommand('export-for-ai-chat.copyFile', testFileUri)
    // Check clipboard content
    const clipboardContent = await vscode.env.clipboard.readText()
    assert.ok(clipboardContent.length > 0, 'Clipboard should not be empty')
    assert.ok(clipboardContent.includes('test.js'), 'Clipboard should contain file name')
    assert.ok(clipboardContent.includes('```'), 'Clipboard should contain code block markers')
  })
  it('Should copy code selection to clipboard', async function () {
    this.timeout(10_000)
    // Open the test file
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]
    assert.ok(workspaceFolder, 'Workspace folder should be available')
    const testFilePath = path.join(workspaceFolder.uri.fsPath, 'a', 'test.js')
    const testFileUri = vscode.Uri.file(testFilePath)
    const document = await vscode.workspace.openTextDocument(testFileUri)
    const editor = await vscode.window.showTextDocument(document)
    // Select some text
    const firstLine = document.lineAt(0)
    editor.selection = new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, firstLine.text.length))
    // Execute the copyCode command
    await vscode.commands.executeCommand('export-for-ai-chat.copyCode')
    // Give it a moment to copy
    await new Promise(resolve => setTimeout(resolve, 500))
    // Check clipboard content
    const clipboardContent = await vscode.env.clipboard.readText()
    assert.ok(clipboardContent.length > 0, 'Clipboard should not be empty after copyCode')
    assert.ok(clipboardContent.includes('```'), 'Clipboard should contain code block markers')
  })
  it('Should handle configuration settings', () => {
    const config = vscode.workspace.getConfiguration('export-for-ai-chat')
    // Check default values
    const showNotifications = config.get('showNotifications')
    assert.strictEqual(typeof showNotifications, 'boolean', 'showNotifications should be a boolean')
    const template = config.get('template')
    assert.strictEqual(typeof template, 'string', 'template should be a string')
    assert.ok((template as string).length > 0, 'template should not be empty')
  })
  it('Should handle workspace folder detection', () => {
    const {workspaceFolders} = vscode.workspace
    assert.ok(workspaceFolders, 'Should have workspace folders')
    assert.ok(workspaceFolders.length > 0, 'Should have at least one workspace folder')
    const firstFolder = workspaceFolders[0]
    assert.ok(firstFolder.name, 'Workspace folder should have a name')
    assert.ok(firstFolder.uri, 'Workspace folder should have a URI')
  })
})
