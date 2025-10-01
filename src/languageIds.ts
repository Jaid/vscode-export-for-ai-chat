import type {Dict} from 'more-types'

export type Language = {
  codeBlockId?: string
  title: string
}

const map: Dict<Language | string> = {
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  json: 'JSON',
  jsonc: {
    title: 'JSON with Comments',
    codeBlockId: 'JSONC',
  },
  yaml: 'YAML',
  xml: 'XML',
  typescriptreact: {
    title: 'TypeScript React',
    codeBlockId: 'TSX',
  },
  ahk: 'AutoHotkey',
  ahk2: {
    title: 'AutoHotkey v2',
    codeBlockId: 'AutoHotkey', // unfortunately no language id for AutoHotkey v2
  },
  bat: {
    title: 'Windows Batch',
    codeBlockId: 'Winbatch',
  },
  dockercompose: {
    title: 'Docker Compose',
    codeBlockId: 'YAML',
  },
  css: 'CSS',
  dockerfile: 'Dockerfile',
  go: 'Go',
  handlebars: 'Handlebars',
  ini: 'INI',
  properties: 'INI',
  java: 'Java',
  'jsx-tags': 'JSX',
  less: 'Less',
  jsonl: {
    title: 'JSON Lines',
    codeBlockId: 'JSON',
  },
  lua: 'Lua',
  perl: 'Perl',
  powershell: 'PowerShell',
  python: 'Python',
  r: 'R',
  ruby: 'Ruby',
  shellscript: 'Bash',
  'github-actions-workflow': {
    title: 'GitHub Actions Workflow',
    codeBlockId: 'YAML',
  },
  caddyfile: {
    title: 'Caddyfile',
  },
  json5: 'JSON5',
  toml: 'TOML',
  jinja: 'Jinja',
  ssh_config: {
    title: 'SSH Config',
    codeBlockId: 'INI',
  },
  sass: 'Sass',
}

export const getLanguageFromLanguageId = (languageId: keyof typeof map) => {
  const language = map[languageId]
  if (!language) {
    return
  }
  if (typeof language === 'string') {
    return {
      title: language,
      codeBlockId: language,
    }
  }
  return language
}
