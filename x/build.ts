import type {BunPlugin} from 'bun'
import type {PackageJson} from 'type-fest'

import * as path from 'forward-slash-path'
import * as lodash from 'lodash-es'

const rootFolder = path.resolve(import.meta.dirname, '..')
const packageJsonPath = path.join(rootFolder, 'package.json')
const packageJson = await Bun.file(packageJsonPath).json() as PackageJson
const emitPackageJsonPlugin: BunPlugin = {
  name: 'EmitPackageJsonPlugin',
  setup(build) {
    build.onEnd(async result => {
      if (!result.success) {
        return
      }
      const relevantPackage = lodash.pick(packageJson, [
        'type',
        'repository',
        'homepage',
        'version',
        'description',
        'engines',
        'categories',
        'displayName',
        'contributes',
        'activationEvents',
        'extensionKind',
      ])
      const id = packageJson.name!.replace(/^vscode-/, '')
      const outPackage = {
        ...relevantPackage,
        name: id,
        main: 'index.js',
        publisher: 'jaidchen',
      }
      const outPath = path.join(rootFolder, 'out', 'bun', 'package.json')
      await Bun.write(outPath, JSON.stringify(outPackage))
    })
  },
}
await Bun.build({
  entrypoints: [path.join(rootFolder, 'src', 'extension.ts')],
  outdir: path.join(rootFolder, 'out', 'bun'),
  target: 'node',
  external: ['vscode'],
  naming: {
    entry: '[dir]/index.js',
  },
  plugins: [emitPackageJsonPlugin],
})
// Build test files
// await Bun.build({
//   entrypoints: [
//     path.join(rootFolder, 'test', 'index.ts'),
//     path.join(rootFolder, 'test', 'main.test.ts'),
//   ],
//   outdir: path.join(rootFolder, 'out', 'bun', 'test'),
//   target: 'node',
//   external: ['vscode', 'mocha'],
//   naming: {
//     entry: '[dir]/[name].js',
//   },
// })
