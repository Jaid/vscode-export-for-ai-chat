import type {PackageJson} from 'type-fest'

import * as path from 'forward-slash-path'
import * as lodash from 'lodash-es'
import {toYaml} from 'zeug'

const rootFolder = path.resolve(import.meta.dirname, '..')
const contributesFile = path.join(rootFolder, 'contributes.yml')
const contributes = Bun.YAML.parse(await Bun.file(contributesFile).text()) as PackageJson['contributes']
const templateFile = path.join(rootFolder, 'etc', 'default_template.md.hbs')
const templateContent = await Bun.file(templateFile).text()
const templateContentSquashed = templateContent.replaceAll('\n', '').trim()
// @ts-expect-error TS2769
lodash.set(contributes, 'configuration.properties["export-for-ai-chat.template"].default', templateContentSquashed)
const output = toYaml(contributes)
await Bun.write(contributesFile, `yaml-language-server: $schema=https://gist.githubusercontent.com/Jaid/1196746806dc7be1eaa7783e4d7b388a/raw/extension_manifest.schema.json#properties/contributes\n${output}`)
