import type { TemplateField } from './types'

export const controlClass =
  'w-full rounded-xl border border-[#d6d5ce] bg-[#fbfaf6] px-3 py-2 text-sm text-[#17221d] outline-none transition placeholder:text-[#9b9e98] focus:border-[#39775f] focus:ring-3 focus:ring-[#39775f]/10 dark:border-white/15 dark:bg-[#24342c] dark:text-[#e6eee9] dark:placeholder:text-[#94a69c]'

export function FieldLabel({ label }: Pick<TemplateField, 'label'>) {
  return (
    <span className="mb-1.5 block text-[11px] font-bold tracking-widest text-[#59665f] uppercase dark:text-[#b8c8be]">
      {label}
    </span>
  )
}
