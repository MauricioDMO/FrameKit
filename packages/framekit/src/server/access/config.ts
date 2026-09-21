const invalidAuthenticationConfigurationMessage = 'FRAMEKIT_AUTH_ENABLED must be exactly "true" or "false" when set'

export class AuthenticationConfigurationError extends Error {
  constructor () {
    super(invalidAuthenticationConfigurationMessage)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = 'AuthenticationConfigurationError'
  }
}

export function isAuthenticationEnabled (env: NodeJS.ProcessEnv = process.env): boolean {
  switch (env.FRAMEKIT_AUTH_ENABLED) {
    case undefined:
    case 'false':
      return false
    case 'true':
      return true
    default:
      throw new AuthenticationConfigurationError()
  }
}
