import { NextResponse, type NextRequest } from 'next/server'

import { getPreferredLocale, hasLocale } from '@/i18n/locales'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const pathLocale = pathname.split('/')[1]

  if (hasLocale(pathLocale)) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = `/${getPreferredLocale(request.headers.get('accept-language'))}${pathname === '/' ? '' : pathname}`

  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
}
