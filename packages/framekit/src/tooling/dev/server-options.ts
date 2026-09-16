export function getServerOptions (environment: Record<string, string | undefined>) {
  const hostname = environment.FRAMEKIT_HOST ?? environment.HOST ?? 'localhost'
  const portValue = environment.PORT ?? '3000'
  const port = Number(portValue)

  if (!/^[0-9]+$/.test(portValue) || !Number.isSafeInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`Invalid PORT: ${environment.PORT}`)
  }

  return { hostname, port }
}
