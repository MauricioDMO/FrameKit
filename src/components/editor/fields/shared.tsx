import type { TemplateField } from '@/lib/templates/types'

export const controlClass =
  'w-full rounded-xl border border-[#d6d5ce] bg-[#fbfaf6] px-3.5 py-2.5 text-sm text-[#17221d] outline-none transition placeholder:text-[#9b9e98] focus:border-[#39775f] focus:ring-3 focus:ring-[#39775f]/10'

export function FieldLabel({ label }: Pick<TemplateField, 'label'>) {
  return (
    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.1em] text-[#59665f]">
      {label}
    </span>
  )
}
