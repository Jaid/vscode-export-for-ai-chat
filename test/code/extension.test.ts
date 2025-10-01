import * as assert from 'node:assert'

import {suite, test} from 'mocha'
import * as vscode from 'vscode'

suite('Extension', () => {
  test('should be present', () => {
    const extension = vscode.extensions.getExtension('jaidchen.export-for-ai-chat')
    assert.ok(extension, 'Extension should be installed')
  })
  test('should activate', async () => {
    const extension = vscode.extensions.getExtension('jaidchen.export-for-ai-chat')
    if (!extension) {
      throw new Error('Extension not found')
    }
    await extension.activate()
    assert.strictEqual(extension.isActive, true, 'Extension should be active')
  })
})
