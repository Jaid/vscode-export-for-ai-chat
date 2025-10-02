# vscode-export-for-ai-chat

A VS Code extension that copies code, files and folders to the clipboard in a format optimized for AI chat assistants.

## Template

A Handlebars template can be [configured](vscode://settings/export-for-ai-chat.template) to customize the output format. The default template is designed for ChatGPT, but you can modify it to suit your needs. The default can be found [here](https://github.com/Jaid/vscode-export-for-ai-chat/blob/main/package.json#:~:text=export%2Dfor%2Dai%2Dchat.template). HTML escaping is disabled, which means `{{var}}` and `{{{var}}}` have the same effect.

### Current default

```hbs
Here are {{items.length}} files from a project I am currently working on:{{blankLine}}{{#each items}}{{#if fileRelative}}File: `{{fileRelative}}`{{blankLine}}{{/if}}{{#if code}}{{fence code}}{{#if language.codeBlockId}}{{language.codeBlockId}}{{else}}{{languageId}}{{/if}}{{newline}}{{code}}{{newline}}{{fence code}}{{/if}}{{#unless @last}}{{blankLine}}{{/unless}}{{/each}}{{blankLine}}I will ask you questions about it. Please answer in a comprehensive and teaching manner and provide in-depth knowledge and useful tips and tricks where applicable.
```

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

### Parameters

name|description|type|availability
---|---|---|---
newline|a static newline character|string|always
blankLine|a static newline-newline sequence|string|always
workspaceName|name of the workspace|string|always
workspaceFolder|absolute file system path of the workspace folder|string|when workspace is open
workspaceFolderName|name of the workspace folder|string|when workspace is open
items|array of exported items with their metadata|array|always
items[].code|the code/text content|string|when item has text content
items[].languageId|VS Code language identifier (e.g., "typescript", "javascript")|string|when language is detected
items[].language|language object with title and codeBlockId|object|when language is mapped
items[].language.title|human-readable language name (e.g., "TypeScript", "JavaScript")|string|when language is mapped
items[].language.codeBlockId|identifier for markdown code blocks (e.g., "TypeScript", "TSX")|string|when language has custom code block ID
items[].isWholeFile|whether the entire file is included (not just a selection)|boolean|always
items[].file|absolute file system path|string|when item is from a file
items[].fileName|name of the file with extension|string|when item is from a file
items[].fileRelative|workspace-relative file path|string|when item is from a file in workspace
items[].folder|absolute folder path|string|when item represents a folder
items[].folderName|name of the folder|string|when item represents a folder
items[].folderRelative|workspace-relative folder path|string|when item is a folder in workspace
