function style(code: string, text: string): string {
  if (!process.stdout.isTTY || process.env.NO_COLOR) return text
  return `${code}${text}\u001b[0m`
}

export function bold(text: string): string {
  return style('\u001b[1m', text)
}

export function cyan(text: string): string {
  return style('\u001b[36m', text)
}

export function dim(text: string): string {
  return style('\u001b[2m', text)
}

export function green(text: string): string {
  return style('\u001b[32m', text)
}

export function red(text: string): string {
  return style('\u001b[31m', text)
}
