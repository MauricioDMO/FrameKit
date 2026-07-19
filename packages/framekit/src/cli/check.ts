import { createRequire } from 'node:module'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

import type { DiscoveredTemplate } from '../discovery/types'
import { generate } from './generate'
import { runChild } from './run-child'

const require = createRequire(import.meta.url)

function createCheckSource(templates: readonly DiscoveredTemplate[], checkFile: string): string {
  const imports = templates.map((template, index) => {
    const templateFile = path.join(template.absolutePath, 'template.tsx')
    let specifier = path.relative(path.dirname(checkFile), templateFile).replaceAll(path.sep, '/')
    if (!specifier.startsWith('.')) specifier = `./${specifier}`
    return `import template${index} from ${JSON.stringify(specifier)}`
  })
  const entries = templates.map((template, index) =>
    `  [${JSON.stringify(path.join(template.absolutePath, 'template.tsx'))}, template${index}],`
  )

  return `${imports.join('\n')}
import { resolveTemplateData, validateTemplateData, validateTemplateDefinition } from '@mauriciodmo/framekit'

const templates = [
${entries.join('\n')}
] as const

let failed = false

for (const [templatePath, definition] of templates) {
  const definitionResult = validateTemplateDefinition(definition)

  if (!definitionResult.success) {
    console.error(\`\${templatePath}: \${definitionResult.error}\`)
    failed = true
    continue
  }

  for (const locale of Object.keys(definitionResult.definition.content)) {
    const data = resolveTemplateData(definitionResult.definition, locale, {})
    const errors = validateTemplateData(definitionResult.definition, data)

    for (const [field, error] of Object.entries(errors)) {
      const limit = 'min' in error ? \` (min: \${error.min})\` : 'max' in error ? \` (max: \${error.max})\` : ''
      console.error(\`\${templatePath}: content.\${locale}.\${field}: \${error.code}\${limit}\`)
      failed = true
    }
  }
}

if (failed) process.exitCode = 1
`
}

export async function check(projectRoot: string): Promise<number> {
  const templates = await generate(projectRoot)
  const framekitDirectory = path.join(projectRoot, '.framekit')
  await mkdir(framekitDirectory, { recursive: true })
  const temporaryDirectory = await mkdtemp(path.join(framekitDirectory, 'check-'))
  const checkFile = path.join(temporaryDirectory, 'templates.mts')

  try {
    await writeFile(checkFile, createCheckSource(templates, checkFile), 'utf8')
    return await runChild(require.resolve('tsx/cli'), [checkFile], projectRoot)
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true })
  }
}
