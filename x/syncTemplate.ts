import type {PackageJson} from 'type-fest'

import * as path from 'forward-slash-path'
import * as lodash from 'lodash-es'
import {toCleanYamlFile} from 'zeug'

const rootFolder = path.resolve(import.meta.dirname, '..')
const contributesFile = path.join(rootFolder, 'contributes.yml')
const contributes = await Bun.file(contributesFile).json() as PackageJson['contributes']
const templateFile = path.join(rootFolder, 'etc', 'default_template.md.hbs')
const templateContent = await Bun.file(templateFile).text()
const templateContentSquashed = templateContent.replaceAll('\n', '').trim()
lodash.set(contributes, 'configuration.properties["export-for-ai-chat.template"].default', templateContentSquashed)
await toCleanYamlFile(contributesFile, contributes)
