import * as assert from 'node:assert'

import * as vscode from 'vscode'

describe('Extension', () => {
  it('should be present', () => {
    const extension = vscode.extensions.getExtension('jaidchen.export-for-ai-chat')
    assert.ok(extension, 'Extension should be installed')
  })
  it('should activate', async () => {
    const extension = vscode.extensions.getExtension('jaidchen.export-for-ai-chat')
    if (!extension) {
      throw new Error('Extension not found')
    }
    await extension.activate()
    assert.strictEqual(extension.isActive, true, 'Extension should be active')
  })
  it('should have correct package metadata', () => {
    const extension = vscode.extensions.getExtension('jaidchen.export-for-ai-chat')
    assert.ok(extension, 'Extension should be installed')
    assert.strictEqual(extension.packageJSON.displayName, 'Export for AI chat')
    assert.strictEqual(extension.packageJSON.name, 'export-for-ai-chat')
    assert.ok(extension.packageJSON.description, 'Should have a description')
  })
})
describe('Commands', () => {
  let extension: vscode.Extension<any> | undefined
  it('should register copyToClipboard command', async () => {
    extension = vscode.extensions.getExtension('jaidchen.export-for-ai-chat')
    if (!extension) {
      throw new Error('Extension not found')
    }
    await extension.activate()
    const commands = await vscode.commands.getCommands(true)
    assert.ok(commands.includes('export-for-ai-chat.copyToClipboard'), 'copyToClipboard command should be registered')
  })
  it('should have command in package.json contributes', () => {
    extension = vscode.extensions.getExtension('jaidchen.export-for-ai-chat')
    if (!extension) {
      throw new Error('Extension not found')
    }
    const {contributes} = extension.packageJSON
    assert.ok(contributes.commands, 'Should have commands in contributes')
    assert.strictEqual(contributes.commands.length, 1, 'Should have exactly 1 command')
    const commandIds = new Set(contributes.commands.map((cmd: any) => cmd.command))
    assert.ok(commandIds.has('export-for-ai-chat.copyToClipboard'), 'Should include copyToClipboard')
  })
})
describe('Configuration', () => {
  it('should have template configuration', () => {
    const config = vscode.workspace.getConfiguration('export-for-ai-chat')
    const template = config.get<string>('template')
    assert.ok(template, 'Template configuration should exist')
    assert.ok(template.length > 0, 'Template should not be empty')
    assert.ok(template.includes('{{'), 'Template should contain Handlebars syntax')
  })
  it('should have showNotifications configuration', () => {
    const config = vscode.workspace.getConfiguration('export-for-ai-chat')
    const showNotifications = config.get<boolean>('showNotifications')
    assert.strictEqual(typeof showNotifications, 'boolean', 'showNotifications should be a boolean')
  })
  it('should have correct default value for showNotifications', () => {
    const extension = vscode.extensions.getExtension('jaidchen.export-for-ai-chat')
    if (!extension) {
      throw new Error('Extension not found')
    }
    const configDefaults = extension.packageJSON.contributes.configuration.properties
    assert.strictEqual(configDefaults['export-for-ai-chat.showNotifications'].default, true, 'showNotifications should default to true')
  })
  it('should have configuration properties defined in package.json', () => {
    const extension = vscode.extensions.getExtension('jaidchen.export-for-ai-chat')
    if (!extension) {
      throw new Error('Extension not found')
    }
    const {contributes} = extension.packageJSON
    assert.ok(contributes.configuration, 'Should have configuration in contributes')
    assert.ok(contributes.configuration.properties, 'Should have configuration properties')
    const {properties} = contributes.configuration
    assert.ok(properties['export-for-ai-chat.template'], 'Should have template property')
    assert.ok(properties['export-for-ai-chat.showNotifications'], 'Should have showNotifications property')
    assert.ok(properties['export-for-ai-chat.countTokens'], 'Should have countTokens property')
    assert.ok(properties['export-for-ai-chat.filterExpression'], 'Should have filterExpression property')
  })
  it('template configuration should have correct type', () => {
    const extension = vscode.extensions.getExtension('jaidchen.export-for-ai-chat')
    if (!extension) {
      throw new Error('Extension not found')
    }
    const {properties} = extension.packageJSON.contributes.configuration
    assert.strictEqual(properties['export-for-ai-chat.template'].type, 'string', 'Template should be a string type')
  })
  it('showNotifications configuration should have correct type', () => {
    const extension = vscode.extensions.getExtension('jaidchen.export-for-ai-chat')
    if (!extension) {
      throw new Error('Extension not found')
    }
    const {properties} = extension.packageJSON.contributes.configuration
    assert.strictEqual(properties['export-for-ai-chat.showNotifications'].type, 'boolean', 'showNotifications should be a boolean type')
  })
  it('countTokens configuration should have correct type', () => {
    const extension = vscode.extensions.getExtension('jaidchen.export-for-ai-chat')
    if (!extension) {
      throw new Error('Extension not found')
    }
    const {properties} = extension.packageJSON.contributes.configuration
    assert.strictEqual(properties['export-for-ai-chat.countTokens'].type, 'boolean', 'countTokens should be a boolean type')
  })
  it('filterExpression configuration should have correct type', () => {
    const extension = vscode.extensions.getExtension('jaidchen.export-for-ai-chat')
    if (!extension) {
      throw new Error('Extension not found')
    }
    const {properties} = extension.packageJSON.contributes.configuration
    assert.strictEqual(properties['export-for-ai-chat.filterExpression'].type, 'string', 'filterExpression should be a string type')
  })
  it('should have countTokens configuration', () => {
    const config = vscode.workspace.getConfiguration('export-for-ai-chat')
    const countTokens = config.get<boolean>('countTokens')
    assert.strictEqual(typeof countTokens, 'boolean', 'countTokens should be a boolean')
  })
  it('should have correct default value for countTokens', () => {
    const extension = vscode.extensions.getExtension('jaidchen.export-for-ai-chat')
    if (!extension) {
      throw new Error('Extension not found')
    }
    const configDefaults = extension.packageJSON.contributes.configuration.properties
    assert.strictEqual(configDefaults['export-for-ai-chat.countTokens'].default, true, 'countTokens should default to true')
  })
  it('should have filterExpression configuration', () => {
    const config = vscode.workspace.getConfiguration('export-for-ai-chat')
    const filterExpression = config.get<string>('filterExpression')
    assert.strictEqual(typeof filterExpression, 'string', 'filterExpression should be a string')
  })
})
describe('Menus', () => {
  it('should have editor context menu contribution', () => {
    const extension = vscode.extensions.getExtension('jaidchen.export-for-ai-chat')
    if (!extension) {
      throw new Error('Extension not found')
    }
    const {contributes} = extension.packageJSON
    assert.ok(contributes.menus, 'Should have menus in contributes')
    assert.ok(contributes.menus['editor/context'], 'Should have editor/context menu')
    const editorMenu = contributes.menus['editor/context']
    const copyToClipboardMenu = editorMenu.find((m: any) => m.command === 'export-for-ai-chat.copyToClipboard')
    assert.ok(copyToClipboardMenu, 'Should have copyToClipboard in editor context menu')
    assert.strictEqual(copyToClipboardMenu.group, '9_cutcopypaste', 'Should be in copy/paste group')
  })
  it('should have explorer context menu contribution', () => {
    const extension = vscode.extensions.getExtension('jaidchen.export-for-ai-chat')
    if (!extension) {
      throw new Error('Extension not found')
    }
    const {contributes} = extension.packageJSON
    assert.ok(contributes.menus['explorer/context'], 'Should have explorer/context menu')
    const explorerMenu = contributes.menus['explorer/context']
    assert.strictEqual(explorerMenu.length, 1, 'Should have 1 item in explorer context menu')
    const copyToClipboardMenu = explorerMenu.find((m: any) => m.command === 'export-for-ai-chat.copyToClipboard')
    assert.ok(copyToClipboardMenu, 'Should have copyToClipboard in explorer context menu')
    assert.strictEqual(copyToClipboardMenu.group, '5_cutcopypaste', 'copyToClipboard should be in copy/paste group')
  })
})
describe('Categories', () => {
  it('should have correct categories', () => {
    const extension = vscode.extensions.getExtension('jaidchen.export-for-ai-chat')
    if (!extension) {
      throw new Error('Extension not found')
    }
    const {categories} = extension.packageJSON
    assert.ok(Array.isArray(categories), 'Categories should be an array')
    assert.ok(categories.includes('Education'), 'Should include Education category')
    assert.ok(categories.includes('Other'), 'Should include Other category')
  })
})
describe('Engines', () => {
  it('should specify minimum VS Code version', () => {
    const extension = vscode.extensions.getExtension('jaidchen.export-for-ai-chat')
    if (!extension) {
      throw new Error('Extension not found')
    }
    const {engines} = extension.packageJSON
    assert.ok(engines.vscode, 'Should specify VS Code engine version')
    assert.ok(engines.vscode.startsWith('^'), 'Should use caret range for VS Code version')
  })
})
