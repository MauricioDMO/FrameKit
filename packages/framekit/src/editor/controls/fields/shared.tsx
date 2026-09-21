import type { TemplateField } from '@/editor/types'

export const controlClass =
  'w-full rounded-xl border border-fk-ivory-400 bg-fk-ivory-100 px-3 py-2 text-sm text-fk-forest-400 outline-none transition placeholder:text-fk-sage-300 focus:border-fk-mint-300 focus:ring-3 focus:ring-fk-mint-300/10 dark:border-white/15 dark:bg-fk-forest-200 dark:text-fk-sage-100'

export function FieldLabel ({ label }: Pick<TemplateField, 'label'>) {
  return (
    <span className="mb-1.5 block select-none text-[11px] font-bold tracking-widest text-fk-sage-400 uppercase dark:text-fk-sage-200">
      {label}
    </span>
  )
}
