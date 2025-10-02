import type {PackageJson} from 'type-fest'

import * as path from 'forward-slash-path'
import * as lodash from 'lodash-es'

const rootFolder = path.resolve(import.meta.dirname, '..')
const packageJsonPath = path.join(rootFolder, 'package.json')
const packageJson = await Bun.file(packageJsonPath).json() as PackageJson
const templateFile = path.join(rootFolder, 'etc', 'default_template.md.hbs')
const templateContent = await Bun.file(templateFile).text()
const templateContentSquashed = templateContent.replaceAll('\n', '').trim()
lodash.set(packageJson, 'contributes.configuration.properties["export-for-ai-chat.template"].default', templateContentSquashed)
const json = JSON.stringify(packageJson, null, 2)
await Bun.write(packageJsonPath, `${json}\n`)
