import * as path from 'forward-slash-path'

const rootFolder = path.resolve(import.meta.dirname, '..')
await Bun.build({
  entrypoints: [path.resolve(rootFolder, 'src', 'extension.ts')],
  outdir: path.resolve(rootFolder, 'out', 'bun'),
  target: 'node',
  external: ['vscode'],
})
