import * as vscode from 'vscode'

export const copyCode = () => {
  const editor = vscode.window.activeTextEditor
  if (editor) {
    const selection = editor.selection
    const text = editor.document.getText(selection)

    if (text) {
      // Add Markdown code block syntax
      const introductionText = `This is a code file from a project I am working on.`
      const languageId = ``
      const code = text.trim()
      const instructionText = `I am stuck and need your help with it. I will ask questions about it. Please answer in an extensive and teaching manner.`
      const codeOpener = `\`\`\``
      const codeCloser = `\`\`\``
      const handlebarsTemplate = `{{introductionText}}\n\n{{codeOpener}}{{languageId}}\n{{code}}\n{{codeCloser}}\n\n{{instructionText}}`
      vscode.env.clipboard.writeText(markdownCode)
      vscode.window.showInformationMessage(`Markdown code copied to clipboard!`)
    } else {
      vscode.window.showErrorMessage(`No text selected!`)
    }
  } else {
    vscode.window.showErrorMessage(`No active editor!`)
  }
}