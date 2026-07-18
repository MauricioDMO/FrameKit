'use client'

const themeScript = `try{const match=document.cookie.match(/(?:^|; )theme=(dark|light)/);const dark=match?match[1]==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',dark);if(!match)document.cookie='theme='+(dark?'dark':'light')+'; path=/; max-age=31536000; samesite=lax'}catch{}`

export function ThemeScript() {
  return (
    <script
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: themeScript }}
    />
  )
}
