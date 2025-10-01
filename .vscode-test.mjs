import {defineConfig} from '@vscode/test-cli'
import * as path from 'forward-slash-path'

export default defineConfig({
  files: 'out/test/*.test.cjs',
  extensionDevelopmentPath: path.join(import.meta.dirname, 'out/bun'),
  workspaceFolder: path.join(import.meta.dirname, 'private/test_project'),
  launchArgs: ['--disable-extensions'],
  mocha: {
    ui: 'bdd',
  },
})
