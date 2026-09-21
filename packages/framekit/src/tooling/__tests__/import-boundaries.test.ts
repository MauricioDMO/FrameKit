import { ESLint } from 'eslint'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')

function createLint (root: string): ESLint {
  return new ESLint({ cwd: root, overrideConfigFile: resolve(root, 'eslint.config.mjs') })
}

async function restrictedMessages (lint: ESLint, filePath: string, source: string) {
  const results = await lint.lintText(source, { filePath: resolve(packageRoot, filePath) })
  return results[0]?.messages
    .filter((message) => message.ruleId === 'no-restricted-imports')
    .map((message) => message.message) ?? []
}

function patternMessage (source: string, boundary: string): string {
  return `'${source}' import is restricted from being used by a pattern. ${boundary}`
}

describe('import boundaries', () => {
  it('enforces layer, adapter, and consumer boundaries', async () => {
    const lint = createLint(packageRoot)

    const cases = [
      {
        filePath: 'src/core/boundary-fixture.ts',
        source: "import type { ResolvedRenderPayload } from '../server/config'\nexport type { ResolvedRenderPayload }\n",
        expected: patternMessage('../server/config', 'Foundation cannot import Editor, Studio, Server, Tooling, or Node built-ins')
      },
      {
        filePath: 'src/editor/boundary-fixture.ts',
        source: "import { value } from '../server'\nexport { value }\n",
        expected: patternMessage('../server', 'Editor cannot import Studio, Server, Tooling, or Node built-ins')
      },
      {
        filePath: 'src/studio/boundary-fixture.ts',
        source: "import { value } from '../server'\nexport { value }\n",
        expected: patternMessage('../server', 'Reusable Studio cannot import Server, Tooling, or Node built-ins')
      },
      {
        filePath: 'src/server/boundary-fixture.ts',
        source: "import { value } from '../tooling'\nexport { value }\n",
        expected: patternMessage('../tooling', 'Server cannot import Editor, Studio, or Tooling')
      },
      {
        filePath: 'src/client/boundary-fixture.tsx',
        source: "import { readFile } from 'node:fs'\nexport { readFile }\n",
        expected: patternMessage('node:fs', 'Node built-in imports are restricted to Server and Tooling')
      },
      {
        filePath: 'src/tooling/boundary-fixture.ts',
        source: "import { value } from '../editor'\nexport { value }\n",
        expected: patternMessage('../editor', 'Tooling cannot import Editor, Studio, or Server')
      },
      {
        filePath: 'src/dev.ts',
        source: "import { value } from './server'\nexport { value }\n",
        expected: patternMessage('./server', 'Tooling cannot import Editor, Studio, or Server')
      },
      {
        filePath: 'src/tooling/dev/create-dev-server/asset-authorization.ts',
        source: "import { renderTemplateImage } from '../../../server/render-image'\nexport { renderTemplateImage }\n",
        expected: patternMessage('../../../server/render-image', 'Tooling may import only the existing Server access contracts')
      },
      {
        filePath: 'src/tooling/dev/create-dev-server/asset-authorization.ts',
        source: "import { renderTemplateImage } from '@/server/render-image'\nexport { renderTemplateImage }\n",
        expected: patternMessage('@/server/render-image', 'Tooling may import only the existing Server access contracts')
      },
      {
        filePath: 'src/tooling/dev/create-dev-server/asset-authorization.ts',
        source: "import { value } from '@/server/access/configuration'\nexport { value }\n",
        expected: patternMessage('@/server/access/configuration', 'Tooling may import only the existing Server access contracts')
      },
      {
        filePath: 'src/tooling/dev/create-dev-server/asset-authorization.ts',
        source: "import { value } from '@/tooling/dev/asset-upload/storage'\nexport { value }\n",
        expected: patternMessage('@/tooling/dev/asset-upload/storage', 'Tooling cannot import Editor, Studio, or Tooling')
      },
      {
        filePath: 'src/tooling/dev/create-dev-server/asset-authorization.ts',
        source: "import { AssetUploadError } from '@/tooling/dev/asset-upload/errors'\nexport { AssetUploadError }\n",
        expected: "'AssetUploadError' import from '@/tooling/dev/asset-upload/errors' is restricted because only 'sendJson' import(s) is/are allowed. Tooling may use only sendJson from this Tooling module"
      },
      {
        filePath: 'src/tooling/dev/create-dev-server/asset-authorization.ts',
        source: "import { AuthenticationConfigurationError } from '@/server/access/config'\nexport { AuthenticationConfigurationError }\n",
        expected: "'AuthenticationConfigurationError' import from '@/server/access/config' is restricted because only 'isAuthenticationEnabled' import(s) is/are allowed. Tooling may use only the authentication flag from this Server access module"
      },
      {
        filePath: 'src/tooling/dev/create-dev-server/asset-authorization.ts',
        source: "import { createSession } from '@/server/access/sessions'\nexport { createSession }\n",
        expected: "'createSession' import from '@/server/access/sessions' is restricted because only 'getSession,isValidSessionSecret' import(s) is/are allowed. Tooling may use only the session checks from this Server access module"
      },
      {
        filePath: 'src/studio/page.tsx',
        source: "import { renderTemplateImage } from '../server/render-image'\nexport { renderTemplateImage }\n",
        expected: patternMessage('../server/render-image', 'Studio adapters may import only the existing Server access contracts')
      },
      {
        filePath: 'src/studio/page.tsx',
        source: "import { renderTemplateImage } from '@/server/render-image'\nexport { renderTemplateImage }\n",
        expected: patternMessage('@/server/render-image', 'Studio adapters may import only the existing Server access contracts')
      },
      {
        filePath: 'src/studio/page.tsx',
        source: "import { value } from '@/server/access/configuration'\nexport { value }\n",
        expected: patternMessage('@/server/access/configuration', 'Studio adapters may import only the existing Server access contracts')
      },
      {
        filePath: 'src/studio-root.ts',
        source: "import { FrameKitStudio } from './studio/types'\nexport { FrameKitStudio }\n",
        expected: patternMessage('./studio/types', 'Studio root adapters may import only the public root and page adapters')
      },
      {
        filePath: 'type-tests/boundary-fixture.ts',
        source: "import { TemplateCanvas } from '@mauriciodmo/framekit/editor'\nexport { TemplateCanvas }\n",
        expected: undefined
      },
      {
        filePath: 'type-tests/boundary-fixture.ts',
        source: "import { value } from '@mauriciodmo/framekit/private'\nexport { value }\n",
        expected: patternMessage('@mauriciodmo/framekit/private', 'Consumers must use a supported FrameKit package entrypoint')
      },
      {
        filePath: 'type-tests/boundary-fixture.ts',
        source: "import { value } from '@mauriciodmo/framekit/src/types'\nexport { value }\n",
        expected: patternMessage('@mauriciodmo/framekit/src/types', 'Consumers must use a supported FrameKit package entrypoint')
      },
      {
        filePath: 'type-tests/boundary-fixture.ts',
        source: "import { value } from '../../packages/framekit/src/types'\nexport { value }\n",
        expected: patternMessage('../../packages/framekit/src/types', 'Consumers cannot import FrameKit source or internal paths')
      }
    ]

    for (const testCase of cases) {
      const messages = await restrictedMessages(lint, testCase.filePath, testCase.source)
      expect(messages).toEqual(testCase.expected === undefined ? [] : [testCase.expected])
    }

    await expect(restrictedMessages(lint, 'src/client/boundary-fixture.tsx', "import { TemplateCanvas } from '../editor'\nexport { TemplateCanvas }\n")).resolves.toEqual([])
    await expect(restrictedMessages(lint, 'src/client/boundary-fixture.tsx', "import { TemplateCanvas } from '../editor/components/template-canvas'\nexport { TemplateCanvas }\n")).resolves.toEqual([
      patternMessage('../editor/components/template-canvas', 'Client must consume render-safe Editor components through the public editor entrypoint')
    ])
    await expect(restrictedMessages(lint, 'src/studio/page.tsx', "import { isAuthenticationEnabled } from '../server/access/config'\nimport { getSession } from '../server/access/sessions'\nexport { isAuthenticationEnabled, getSession }\n")).resolves.toEqual([])
    await expect(restrictedMessages(lint, 'src/studio/page.tsx', "import { isAuthenticationEnabled } from '@/server/access/config'\nimport { getSession } from '@/server/access/sessions'\nexport { isAuthenticationEnabled, getSession }\n")).resolves.toEqual([])
    await expect(restrictedMessages(lint, 'src/studio-root.ts', "import { createStudioPage } from './studio/page'\nexport { createStudioPage }\n")).resolves.toEqual([])
    await expect(restrictedMessages(lint, 'src/tooling/dev/create-dev-server/asset-authorization.ts', "import { isAuthenticationEnabled } from '../../../server/access/config'\nimport { getSession, isValidSessionSecret } from '../../../server/access/sessions'\nexport { isAuthenticationEnabled, getSession, isValidSessionSecret }\n")).resolves.toEqual([])
    await expect(restrictedMessages(lint, 'src/tooling/dev/create-dev-server/asset-authorization.ts', "import { isAuthenticationEnabled } from '@/server/access/config'\nimport { getSession, isValidSessionSecret } from '@/server/access/sessions'\nexport { isAuthenticationEnabled, getSession, isValidSessionSecret }\n")).resolves.toEqual([])
    await expect(restrictedMessages(lint, 'src/tooling/dev/create-dev-server/asset-authorization.ts', "import { sendJson } from '@/tooling/dev/asset-upload/errors'\nexport { sendJson }\n")).resolves.toEqual([])
  }, 10_000)
})
