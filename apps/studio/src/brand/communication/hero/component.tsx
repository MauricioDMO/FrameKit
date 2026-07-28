import { Markdown } from '@mauriciodmo/framekit'

export interface BrandHeroProps {
  eyebrow: string
  title: string
  description: string
  accentColor?: string
}

export function BrandHero({ eyebrow, title, description, accentColor = '#c8f7d9' }: BrandHeroProps) {
  return (
    <section className="max-w-[720px]">
      <Markdown
        value={eyebrow}
        className="mb-7 text-[17px] font-black tracking-[0.28em] uppercase"
        style={{ color: accentColor }}
      />
      <Markdown
        value={title}
        lists
        className="text-[76px] leading-[0.95] font-medium tracking-[-0.06em]"
      />
      <div className="mt-9 flex items-start gap-5">
        <span className="mt-3 h-[3px] w-14 shrink-0" style={{ backgroundColor: accentColor }} />
        <Markdown
          value={description}
          lists
          className="max-w-[570px] text-[23px] leading-[1.4] text-white/70"
        />
      </div>
    </section>
  )
}
