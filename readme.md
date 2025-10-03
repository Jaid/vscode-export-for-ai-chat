# vscode-export-for-ai-chat

A VS Code extension that copies code, files and folders to the clipboard in a format optimized for AI chat assistants.

## Template

A Handlebars template can be [configured](vscode://settings/export-for-ai-chat.template) to customize the output format. The default template is designed for ChatGPT, but you can modify it to suit your needs. The default can be found [here](https://github.com/Jaid/vscode-export-for-ai-chat/blob/main/package.json#:~:text=export%2Dfor%2Dai%2Dchat.template). HTML escaping is disabled, which means `{{var}}` and `{{{var}}}` have the same effect.

### Current default

```hbs
{{#each items}}
{{#if fileRelative}}
./{{fileRelative}}
{{blankLine}}
{{/if}}
{{fence code}}{{#if language.codeBlockId}}{{language.codeBlockId}}{{else}}{{languageId}}{{/if}}
{{newLine}}
{{trim code}}
{{newLine}}
{{fence code}}
{{#unless @last}}
{{blankLine}}
{{/unless}}
{{/each}}
```

This produces results like this:

````markdown
./src/index.ts

```TypeScript
  export const foo = 'bar'
```
````

### Examples

#### Simple

```hbs
{{code}}
```
[Playground](https://handlebarsjs.com/playground.html#format=1&currentExample=%7B%22template%22%3A%22%7B%7Bcode%7D%7D%22%2C%22partials%22%3A%5B%5D%2C%22input%22%3A%22%7B%5Cn%20%20code%3A%20'export%20default%201'%5Cn%7D%5Cn%22%2C%22output%22%3A%22export%20default%201%22%2C%22preparationScript%22%3A%22%22%2C%22handlebarsVersion%22%3A%224.7.8%22%7D)

> [!NOTE]
> Using the `items[]` properties as top-level parameters works in general, but don't forget it may lead to missing content for multi-item exports.

#### Markdown with file names, code fences and language indicators

```hbs
{{#each items}}
File: {{fileRelative}}
{{fence code}}{{#if language.codeBlockId}}{{language.codeBlockId}}{{else}}{{languageId}}{{/if}}
{{code}}
{{fence code}}
{{/each}}
```

### XML

```hbs
{{#each items}}
<attached-file path='{{fileRelative}}'{{#if language.title}} language='{{language.title}}'{{/if}}>
{{code}}
</attached-file>
{{/each}}
```
### JSON

```hbs
{{#if isMultiple items}}
{{json items 2}}
{{else}}
{{json items.[0] 2}}
{{/if}}
```

### Templating variables

#### Global

name|description|type|availability
---|---|---|---

#### Items

name|description|type|availability
---|---|---|---
code|the text content|string|always
isWholeFile|whether `code` is the entire file or only a selected portion|`boolean`|when item comes from a file

#### Helpers

name|description|parameters
---|---|---
newLine|inserts newline characters|`count: number = 1`
blankLine|inserts a blank line|`count: number = 1`
trim|trims surrounding whitespace|`input: string`
fence|inserts a Markdown code fence that is ensured to work for the given content|`code?: string`
