export function getServerOptions(environment: Record<string, string | undefined>) {
  const hostname = environment.FRAMEKIT_HOST ?? environment.HOST ?? 'localhost'
  const port = Number(environment.PORT ?? 3000)

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`Invalid PORT: ${environment.PORT}`)
  }

  return { hostname, port }
}
