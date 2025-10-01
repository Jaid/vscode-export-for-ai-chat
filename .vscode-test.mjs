import {defineConfig} from '@vscode/test-cli'

export default defineConfig({
  files: 'out/bun/test/**/*.test.js',
  extensionDevelopmentPath: './out/bun',
  workspaceFolder: './private/test_project',
  launchArgs: ['--disable-extensions'],
  mocha: {
    ui: 'bdd',
    timeout: 20_000,
  },
})
