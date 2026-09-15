export type UserDomainErrorCode =
  | 'invalid_username'
  | 'invalid_password'
  | 'invalid_role'
  | 'invalid_active'
  | 'invalid_update'
  | 'invalid_user_state'
  | 'invalid_token_name'
  | 'bootstrap_configuration'
  | 'user_not_found'
  | 'duplicate_username'
  | 'last_active_administrator'

export class UserDomainError extends Error {
  readonly code: UserDomainErrorCode

  constructor (code: UserDomainErrorCode, message: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = 'UserDomainError'
    this.code = code
  }
}

export function duplicateUsernameError (): UserDomainError {
  return new UserDomainError('duplicate_username', 'Username is already in use')
}

export function userNotFoundError (): UserDomainError {
  return new UserDomainError('user_not_found', 'User not found')
}

export function lastAdministratorError (): UserDomainError {
  return new UserDomainError('last_active_administrator', 'The last active administrator cannot be removed or disabled')
}
