export class StudioApiError extends Error {
  constructor (readonly status?: number) {
    super('Studio request failed')
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = 'StudioApiError'
  }
}

export async function requestStudioJson<T> (url: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, init)
  } catch {
    throw new StudioApiError()
  }

  if (!response.ok) throw new StudioApiError(response.status)

  try {
    return await response.json() as T
  } catch {
    throw new StudioApiError(response.status)
  }
}
