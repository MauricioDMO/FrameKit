import { cookies, headers } from 'next/headers'
import type { ReactNode } from 'react'
import { FrameKitLocaleProvider } from './locale-provider'
import { getFrameKitLocale } from './messages'

const themeScript = `try{const match=document.cookie.match(/(?:^|; )theme=(dark|light)/);const dark=match?match[1]==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',dark);if(!match)document.cookie='theme='+(dark?'dark':'light')+'; path=/; max-age=31536000; samesite=lax'}catch{}`

export async function FrameKitStudioRoot({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const locale = getFrameKitLocale(cookieStore.get('locale')?.value ?? (await headers()).get('accept-language'))
  const theme = cookieStore.get('theme')?.value
  return <html lang={locale} className={`${theme === 'dark' ? 'dark' : ''} min-h-full scheme-light dark:scheme-dark`} suppressHydrationWarning><head><script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: themeScript }} /></head><body className="m-0 min-h-full bg-[#f0eee7] font-[Arial,Helvetica,sans-serif] text-[#17221d] dark:bg-[#17221d] dark:text-[#e6eee9]"><FrameKitLocaleProvider initialLocale={locale}>{children}</FrameKitLocaleProvider></body></html>
}
