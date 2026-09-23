import { builtinModules } from 'node:module'

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const nodeBuiltinPatterns = [
  { regex: '^node:', message: 'Node built-in imports are restricted to Server and Tooling' },
  { regex: `^(?:${builtinModules.map(escapeRegex).join('|')})(?:/|$)`, message: 'Node built-in imports are restricted to Server and Tooling' }
]
const nextNavigationImport = { regex: '^next/navigation$', message: 'Editor and client render code must receive the pathname from their caller' }

function layerPattern (layers, excluded = []) {
  const exclusion = excluded.length === 0 ? '' : `(?!(?:${excluded.map(escapeRegex).join('|')})$)`
  return `^${exclusion}(?:(?:\\.\\.?/|@/)+(?:${layers.join('|')})|@mauriciodmo/framekit/(?:${layers.join('|')}))(?:/|$)`
}

function restrictedImports (layers, message, includeNodeBuiltins = false) {
  return ['error', {
    patterns: [
      { regex: layerPattern(layers), message },
      ...(includeNodeBuiltins ? nodeBuiltinPatterns : [])
    ]
  }]
}

export const foundationImportBoundary = restrictedImports(
  ['editor', 'studio', 'server', 'tooling'],
  'Foundation cannot import Editor, Studio, Server, Tooling, or Node built-ins',
  true
)

export const editorImportBoundary = restrictedImports(
  ['studio', 'server', 'tooling'],
  'Editor cannot import Studio, Server, Tooling, or Node built-ins',
  true
)
editorImportBoundary[1].patterns.push(nextNavigationImport)

export const clientImportBoundary = ['error', {
  patterns: [
    { regex: layerPattern(['server', 'tooling']), message: 'Client cannot import Server or Tooling' },
    { regex: '^(?:(?:\\.\\.?/|@/)+editor/|@mauriciodmo/framekit/editor/)', message: 'Client must consume render-safe Editor components through the public editor entrypoint' },
    nextNavigationImport,
    ...nodeBuiltinPatterns
  ]
}]

export const studioImportBoundary = restrictedImports(
  ['server', 'tooling'],
  'Reusable Studio cannot import Server, Tooling, or Node built-ins',
  true
)

export const serverImportBoundary = restrictedImports(
  ['editor', 'studio', 'tooling'],
  'Server cannot import Editor, Studio, or Tooling'
)

export const toolingImportBoundary = restrictedImports(
  ['editor', 'studio', 'server'],
  'Tooling cannot import Editor, Studio, or Server'
)

export const toolingAssetAuthorizationImportBoundary = ['error', {
  paths: [
    {
      name: '@/tooling/dev/asset-upload/errors',
      allowImportNames: ['sendJson'],
      message: 'Tooling may use only sendJson from this Tooling module'
    },
    {
      name: '../../../server/access/config',
      allowImportNames: ['isAuthenticationEnabled'],
      message: 'Tooling may use only the authentication flag from this Server access module'
    },
    {
      name: '@/server/access/config',
      allowImportNames: ['isAuthenticationEnabled'],
      message: 'Tooling may use only the authentication flag from this Server access module'
    },
    {
      name: '../../../server/access/sessions',
      allowImportNames: ['getSession', 'isValidSessionSecret'],
      message: 'Tooling may use only the session checks from this Server access module'
    },
    {
      name: '@/server/access/sessions',
      allowImportNames: ['getSession', 'isValidSessionSecret'],
      message: 'Tooling may use only the session checks from this Server access module'
    }
  ],
  patterns: [
    { regex: layerPattern(['editor', 'studio', 'tooling'], ['@/tooling/dev/asset-upload/errors']), message: 'Tooling cannot import Editor, Studio, or Tooling' },
    {
      regex: layerPattern(['server'], ['../../../server/access/config', '../../../server/access/sessions', '@/server/access/config', '@/server/access/sessions']),
      message: 'Tooling may import only the existing Server access contracts'
    }
  ]
}]

export const studioAdapterImportBoundary = ['error', {
  paths: [
    {
      name: '../server/access/config',
      allowImportNames: ['isAuthenticationEnabled'],
      message: 'Studio adapters may use only the authentication flag from this Server access module'
    },
    {
      name: '@/server/access/config',
      allowImportNames: ['isAuthenticationEnabled'],
      message: 'Studio adapters may use only the authentication flag from this Server access module'
    },
    {
      name: '../server/access/sessions',
      allowImportNames: ['getSession'],
      message: 'Studio adapters may use only the session lookup from this Server access module'
    },
    {
      name: '@/server/access/sessions',
      allowImportNames: ['getSession'],
      message: 'Studio adapters may use only the session lookup from this Server access module'
    }
  ],
  patterns: [
    { regex: layerPattern(['editor', 'tooling']), message: 'Studio adapters cannot import Editor or Tooling' },
    {
      regex: layerPattern(['server'], ['../server/access/config', '../server/access/sessions', '@/server/access/config', '@/server/access/sessions']),
      message: 'Studio adapters may import only the existing Server access contracts'
    },
    ...nodeBuiltinPatterns
  ]
}]

export const studioRootAdapterImportBoundary = ['error', {
  patterns: [
    { regex: layerPattern(['editor', 'server', 'tooling']), message: 'Studio root adapters cannot import Editor, Server, or Tooling' },
    {
      regex: layerPattern(['studio'], ['./studio/root', './studio/page']),
      message: 'Studio root adapters may import only the public root and page adapters'
    },
    ...nodeBuiltinPatterns
  ]
}]

export const consumerImportBoundary = ['error', {
  patterns: [
    {
      regex: '^@mauriciodmo/framekit/(?!client$|editor$|qr$|next$|studio$|studio/root$|dev$|server$|styles\\.css$).*',
      message: 'Consumers must use a supported FrameKit package entrypoint'
    },
    {
      regex: '^(?:\\.\\.?/)+.*\\/framekit/(?:src|dist|internal|lib)(?:/|$)',
      message: 'Consumers cannot import FrameKit source or internal paths'
    }
  ]
}]
