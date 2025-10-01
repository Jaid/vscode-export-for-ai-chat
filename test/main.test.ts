import {describe, expect, it} from 'bun:test'

import {getLanguageFromLanguageId} from '../src/languageIds.js'

describe('Language ID Mapping', () => {
  it('should return correct language for TypeScript', () => {
    const result = getLanguageFromLanguageId('typescript')
    expect(result).toBeDefined()
    expect(result?.title).toBe('TypeScript')
    expect(result?.codeBlockId).toBe('TypeScript')
  })
  it('should return correct language for JavaScript', () => {
    const result = getLanguageFromLanguageId('javascript')
    expect(result).toBeDefined()
    expect(result?.title).toBe('JavaScript')
    expect(result?.codeBlockId).toBe('JavaScript')
  })
  it('should return correct language for JSON', () => {
    const result = getLanguageFromLanguageId('json')
    expect(result).toBeDefined()
    expect(result?.title).toBe('JSON')
    expect(result?.codeBlockId).toBe('JSON')
  })
  it('should return correct language for JSONC with custom codeBlockId', () => {
    const result = getLanguageFromLanguageId('jsonc')
    expect(result).toBeDefined()
    expect(result?.title).toBe('JSON with Comments')
    expect(result?.codeBlockId).toBe('JSONC')
  })
  it('should return correct language for YAML', () => {
    const result = getLanguageFromLanguageId('yaml')
    expect(result).toBeDefined()
    expect(result?.title).toBe('YAML')
    expect(result?.codeBlockId).toBe('YAML')
  })
  it('should return correct language for TypeScript React', () => {
    const result = getLanguageFromLanguageId('typescriptreact')
    expect(result).toBeDefined()
    expect(result?.title).toBe('TypeScript React')
    expect(result?.codeBlockId).toBe('TSX')
  })
  it('should return correct language for Python', () => {
    const result = getLanguageFromLanguageId('python')
    expect(result).toBeDefined()
    expect(result?.title).toBe('Python')
    expect(result?.codeBlockId).toBe('Python')
  })
  it('should return correct language for Bash shell scripts', () => {
    const result = getLanguageFromLanguageId('shellscript')
    expect(result).toBeDefined()
    expect(result?.title).toBe('Bash')
    expect(result?.codeBlockId).toBe('Bash')
  })
  it('should return correct language for Docker Compose', () => {
    const result = getLanguageFromLanguageId('dockercompose')
    expect(result).toBeDefined()
    expect(result?.title).toBe('Docker Compose')
    expect(result?.codeBlockId).toBe('YAML')
  })
  it('should return correct language for Dockerfile', () => {
    const result = getLanguageFromLanguageId('dockerfile')
    expect(result).toBeDefined()
    expect(result?.title).toBe('Dockerfile')
    expect(result?.codeBlockId).toBe('Dockerfile')
  })
  it('should return correct language for PowerShell', () => {
    const result = getLanguageFromLanguageId('powershell')
    expect(result).toBeDefined()
    expect(result?.title).toBe('PowerShell')
    expect(result?.codeBlockId).toBe('PowerShell')
  })
  it('should return correct language for AutoHotkey', () => {
    const result = getLanguageFromLanguageId('ahk')
    expect(result).toBeDefined()
    expect(result?.title).toBe('AutoHotkey')
    expect(result?.codeBlockId).toBe('AutoHotkey')
  })
  it('should return correct language for AutoHotkey v2', () => {
    const result = getLanguageFromLanguageId('ahk2')
    expect(result).toBeDefined()
    expect(result?.title).toBe('AutoHotkey v2')
    expect(result?.codeBlockId).toBe('AutoHotkey')
  })
  it('should return correct language for Windows Batch files', () => {
    const result = getLanguageFromLanguageId('bat')
    expect(result).toBeDefined()
    expect(result?.title).toBe('Windows Batch')
    expect(result?.codeBlockId).toBe('Winbatch')
  })
  it('should return correct language for GitHub Actions Workflow', () => {
    const result = getLanguageFromLanguageId('github-actions-workflow')
    expect(result).toBeDefined()
    expect(result?.title).toBe('GitHub Actions Workflow')
    expect(result?.codeBlockId).toBe('YAML')
  })
  it('should return correct language for JSON Lines', () => {
    const result = getLanguageFromLanguageId('jsonl')
    expect(result).toBeDefined()
    expect(result?.title).toBe('JSON Lines')
    expect(result?.codeBlockId).toBe('JSON')
  })
  it('should return correct language for SSH Config', () => {
    const result = getLanguageFromLanguageId('ssh_config')
    expect(result).toBeDefined()
    expect(result?.title).toBe('SSH Config')
    expect(result?.codeBlockId).toBe('INI')
  })
  it('should return correct language for Go', () => {
    const result = getLanguageFromLanguageId('go')
    expect(result).toBeDefined()
    expect(result?.title).toBe('Go')
    expect(result?.codeBlockId).toBe('Go')
  })
  it('should return correct language for Ruby', () => {
    const result = getLanguageFromLanguageId('ruby')
    expect(result).toBeDefined()
    expect(result?.title).toBe('Ruby')
    expect(result?.codeBlockId).toBe('Ruby')
  })
  it('should return correct language for Java', () => {
    const result = getLanguageFromLanguageId('java')
    expect(result).toBeDefined()
    expect(result?.title).toBe('Java')
    expect(result?.codeBlockId).toBe('Java')
  })
  it('should return undefined for unknown language ID', () => {
    const result = getLanguageFromLanguageId('unknown-language' as any)
    expect(result).toBeUndefined()
  })
  it('should handle Caddyfile without codeBlockId', () => {
    const result = getLanguageFromLanguageId('caddyfile')
    expect(result).toBeDefined()
    expect(result?.title).toBe('Caddyfile')
    expect(result?.codeBlockId).toBeUndefined()
  })
  it('should return consistent structure for string-based languages', () => {
    const result = getLanguageFromLanguageId('css')
    expect(result).toBeDefined()
    expect(typeof result?.title).toBe('string')
    expect(typeof result?.codeBlockId).toBe('string')
    expect(result?.title).toBe(result?.codeBlockId)
  })
  it('should handle properties files as INI', () => {
    const result = getLanguageFromLanguageId('properties')
    expect(result).toBeDefined()
    expect(result?.title).toBe('INI')
    expect(result?.codeBlockId).toBe('INI')
  })
  it('should handle INI files', () => {
    const result = getLanguageFromLanguageId('ini')
    expect(result).toBeDefined()
    expect(result?.title).toBe('INI')
    expect(result?.codeBlockId).toBe('INI')
  })
  it('should handle all common web languages', () => {
    const webLanguages = ['css', 'less', 'sass', 'xml'] as const
    for (const lang of webLanguages) {
      const result = getLanguageFromLanguageId(lang)
      expect(result).toBeDefined()
      expect(result?.title).toBeDefined()
    }
  })
  it('should handle all supported scripting languages', () => {
    const scriptingLanguages = ['python', 'ruby', 'perl', 'lua', 'r'] as const
    for (const lang of scriptingLanguages) {
      const result = getLanguageFromLanguageId(lang)
      expect(result).toBeDefined()
      expect(result?.title.toLowerCase()).toBe(lang.toLowerCase())
    }
  })
})
describe('Language ID Edge Cases', () => {
  it('should handle JSX tags', () => {
    const result = getLanguageFromLanguageId('jsx-tags')
    expect(result).toBeDefined()
    expect(result?.title).toBe('JSX')
  })
  it('should distinguish between JSON variants', () => {
    const json = getLanguageFromLanguageId('json')
    const jsonc = getLanguageFromLanguageId('jsonc')
    const json5 = getLanguageFromLanguageId('json5')
    const jsonl = getLanguageFromLanguageId('jsonl')
    expect(json).toBeDefined()
    expect(jsonc).toBeDefined()
    expect(json5).toBeDefined()
    expect(jsonl).toBeDefined()
    expect(json?.title).not.toBe(jsonc?.title)
    expect(json?.title).not.toBe(json5?.title)
    expect(json?.title).not.toBe(jsonl?.title)
  })
  it('should map multiple language IDs to same codeBlockId when appropriate', () => {
    const dockerCompose = getLanguageFromLanguageId('dockercompose')
    const githubActions = getLanguageFromLanguageId('github-actions-workflow')
    expect(dockerCompose).toBeDefined()
    expect(githubActions).toBeDefined()
    expect(dockerCompose?.codeBlockId).toBe('YAML')
    expect(githubActions?.codeBlockId).toBe('YAML')
  })
  it('should preserve specific titles even when using same codeBlockId', () => {
    const dockerCompose = getLanguageFromLanguageId('dockercompose')
    const githubActions = getLanguageFromLanguageId('github-actions-workflow')
    expect(dockerCompose).toBeDefined()
    expect(githubActions).toBeDefined()
    expect(dockerCompose?.title).not.toBe(githubActions?.title)
    expect(dockerCompose?.title).toBe('Docker Compose')
    expect(githubActions?.title).toBe('GitHub Actions Workflow')
  })
})
describe('Language ID Type Safety', () => {
  it('should return an object with title property', () => {
    const result = getLanguageFromLanguageId('typescript')
    expect(result).toBeDefined()
    expect(result).toHaveProperty('title')
    expect(typeof result?.title).toBe('string')
  })
  it('should optionally have codeBlockId property', () => {
    const withCodeBlock = getLanguageFromLanguageId('typescript')
    const withoutCodeBlock = getLanguageFromLanguageId('caddyfile')
    expect(withCodeBlock).toBeDefined()
    expect(withCodeBlock).toHaveProperty('codeBlockId')
    expect(withCodeBlock?.codeBlockId).toBeDefined()
    expect(withoutCodeBlock).toBeDefined()
    expect(withoutCodeBlock?.codeBlockId).toBeUndefined()
  })
  it('should handle TypeScript type narrowing correctly', () => {
    const result = getLanguageFromLanguageId('typescript')
    if (result) {
      expect(result.title).toBe('TypeScript')
      if (result.codeBlockId) {
        expect(typeof result.codeBlockId).toBe('string')
      }
    }
  })
})
