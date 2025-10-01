import * as assert from 'node:assert'

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
})
