# vscode-export-for-ai-chat

A VS Code extension that copies code, files, and folders to the clipboard in a format optimized for AI chat assistants.

## Features

- **Copy Code**: Copy selected code or the entire file from the editor with context
- **Copy File**: Right-click a file in the explorer to copy it for AI chat
- **Copy Folder**: Right-click a folder to copy all its files for AI chat
- **Customizable Templates**: Use Handlebars templates to customize the output format
- **Multi-file Support**: Copy multiple files at once with proper formatting

## Commands

- `Export for AI chat: Copy for AI chat` - Copy code from the active editor
- `Export for AI chat: Copy file for AI chat` - Copy a single file (explorer context menu)
- `Export for AI chat: Copy folder for AI chat` - Copy all files in a folder (explorer context menu)

## Configuration

### Template

Customize the output template using Handlebars syntax in your VS Code settings:

```json
{
  "export-for-ai-chat.template": "Your custom template here"
}
```

Available template variables:
- `items` - Array of items being copied
- `hasMultiple` - Boolean indicating if multiple items are being copied
- `workspaceName` - Name of the current workspace
- `codeOpener` - Opening code fence (\`\`\`)
- `codeCloser` - Closing code fence (\`\`\`)
- `blankLine` - Two newlines
- `newline` - Single newline

Each item in `items` has:
- `code` - The code content
- `languageId` - VS Code language identifier
- `language.title` - Human-readable language name
- `language.codeBlockId` - Language identifier for code blocks
- `isWholeFile` - Boolean indicating if the entire file was copied
- `file` - Full file path
- `fileName` - File name only
- `fileRelative` - Path relative to workspace

### Show Notifications

Control whether to show notifications after copying:

```json
{
  "export-for-ai-chat.showNotifications": true
}
```

## Usage

1. Open a file in VS Code
2. Select code (or leave empty to copy the entire file)
3. Right-click and select "Copy for AI chat" from the context menu
4. Paste into your AI chat assistant

Or right-click files/folders in the explorer and select the appropriate copy command.

## Development

Build the extension:

```bash
bun run build
```

Package the extension:

```bash
bun run package
```

## License

See [license.txt](license.txt)
