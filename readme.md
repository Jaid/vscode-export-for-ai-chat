# vscode-export-for-ai-chat

A VS Code extension that copies code, files and folders to the clipboard in a format optimized for AI chat assistants.

## Template

A Handlebars template can be [configured](vscode://settings/export-for-ai-chat.template) to customize the output format. The default template is designed for ChatGPT, but you can modify it to suit your needs. The default can be found [here](https://github.com/Jaid/vscode-export-for-ai-chat/blob/main/package.json#:~:text=export%2Dfor%2Dai%2Dchat.template). HTML escaping is disabled, which means `{{var}}` and `{{{var}}}` have the same effect.

### Current default

```hbs
{{#if hasMultiple}}Here are {{items.length}} files from a project I am currently working on:{{blankLine}}{{#each items}}{{#if fileRelative}}File: `{{fileRelative}}`{{blankLine}}{{/if}}{{#if code}}{{codeOpener}}{{#if language.codeBlockId}}{{language.codeBlockId}}{{else}}{{languageId}}{{/if}}{{newline}}{{code}}{{newline}}{{codeCloser}}{{/if}}{{#unless @last}}{{blankLine}}{{/unless}}{{/each}}{{else}}{{#with items.[0]}}{{#if code}}This is {{#if isWholeFile}}a {{/if}}{{#if language.title}}{{language.title}} code{{else}}code{{/if}} {{#if isWholeFile}}file {{/if}}from a project I am currently working on.{{blankLine}}{{#if fileRelative}}File: `{{fileRelative}}`{{blankLine}}{{/if}}{{codeOpener}}{{#if language.codeBlockId}}{{language.codeBlockId}}{{else}}{{languageId}}{{/if}}{{newline}}{{code}}{{newline}}{{codeCloser}}{{blankLine}}I am stuck and need your help with it.{{else}}I am stuck at a programming project I am currently working on and I need your help with it.{{/if}}{{/with}}{{/if}}{{blankLine}}I will ask you questions about it. Please answer in a comprehensive and teaching manner and provide in-depth knowledge and useful tips and tricks where applicable.
```

### Parameters

name|description|type|availability
---|---|---|---
codeOpener|a static backtick-backtick-backtick sequence|string|always
codeCloser|a static backtick-backtick-backtick sequence|string|always
newline|a static newline|string|always|always
blankLine|a static newline-newline sequence|string|always
TODO
