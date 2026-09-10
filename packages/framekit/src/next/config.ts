import type { NextConfig } from 'next/types'

const frameKitDistDir = '.framekit/next'
const frameKitOutput = 'standalone'
const frameKitRootRedirect = { source: '/', destination: '/editor', permanent: false }

type NextRedirect = Awaited<ReturnType<NonNullable<NextConfig['redirects']>>>[number]

function isFrameKitRootRedirect (redirect: NextRedirect): boolean {
  const isTemporary = (redirect.permanent === false && redirect.statusCode === undefined) || (redirect.statusCode === 307 && redirect.permanent === undefined)
  return redirect.source === '/' &&
    redirect.destination === '/editor' &&
    isTemporary &&
    redirect.basePath === undefined &&
    redirect.locale === undefined &&
    redirect.has === undefined &&
    redirect.missing === undefined &&
    redirect.priority === undefined
}

export function withFrameKit (config: NextConfig = {}): NextConfig {
  if (config.distDir !== undefined && config.distDir !== frameKitDistDir) {
    throw new Error(`FrameKit configuration conflict: distDir must be "${frameKitDistDir}"`)
  }
  if (config.output !== undefined && config.output !== frameKitOutput) {
    throw new Error(`FrameKit configuration conflict: output must be "${frameKitOutput}"`)
  }

  const redirects = config.redirects
  return {
    ...config,
    distDir: frameKitDistDir,
    output: frameKitOutput,
    async redirects () {
      const customRedirects = redirects === undefined ? [] : await redirects()

      for (const redirect of customRedirects) {
        if (redirect.source !== '/') continue
        if (!isFrameKitRootRedirect(redirect)) {
          throw new Error('FrameKit configuration conflict: the root redirect must be an exact temporary 307 redirect to "/editor"')
        }
      }

      return [frameKitRootRedirect, ...customRedirects.filter((redirect) => !isFrameKitRootRedirect(redirect))]
    }
  }
}
