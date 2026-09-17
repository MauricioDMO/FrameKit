import { IconCircleCheck, IconCircleX, IconInfoCircle } from '@tabler/icons-react'
import type { ReactNode } from 'react'

import type { BasicToastProps } from './types'

function BasicToast ({ message, icon, className }: BasicToastProps & { icon: ReactNode, className: string }) {
  return (
    <div className={`flex min-w-0 items-start gap-3 rounded-2xl border px-4 py-3.5 pr-12 text-sm leading-5 shadow-lg ${className}`}>
      <span className="mt-0.5 shrink-0" aria-hidden="true">{icon}</span>
      <p className="min-w-0 break-words">{message}</p>
    </div>
  )
}

export function SuccessToast ({ message }: BasicToastProps) {
  return <BasicToast message={message} icon={<IconCircleCheck size={20} />} className="border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-400/30 dark:bg-emerald-950/60 dark:text-emerald-100" />
}

export function ErrorToast ({ message }: BasicToastProps) {
  return <BasicToast message={message} icon={<IconCircleX size={20} />} className="border-red-200 bg-red-50 text-red-950 dark:border-red-400/30 dark:bg-red-950/60 dark:text-red-100" />
}

export function InfoToast ({ message }: BasicToastProps) {
  return <BasicToast message={message} icon={<IconInfoCircle size={20} />} className="border-fk-mint-300/60 bg-fk-mint-100 text-fk-forest-400 dark:border-fk-mint-300/30 dark:bg-fk-forest-300 dark:text-fk-mint-100" />
}
