import { defineTemplate, fields, Markdown } from '@mauriciodmo/framekit'

import { BrandHero } from '@/brand/communication/hero/component'

export default defineTemplate({
  width: 1440,
  height: 1440,
  fields: {
    eyebrow: fields.text({ label: 'Etiqueta', placeholder: 'NUEVO / FRAMEKIT' }),
    title: fields.textarea({ label: 'Título', placeholder: 'Diseña imágenes desde React' }),
    description: fields.textarea({ label: 'Descripción' }),
    website: fields.text({ label: 'Sitio web' }),
    accentColor: fields.color({ label: 'Color de acento', defaultValue: '#c8f7d9' }),
  },
  content: {
    es: {
      language: 'Español',
      eyebrow: 'NUEVO / FRAMEKIT',
      title: 'Diseña imágenes desde **React**',
      description: 'Plantillas editables para crear contenido visual consistente, reutilizable y listo para exportar.',
      website: 'framekit.dev',
    },
    en: {
      language: 'English',
      eyebrow: 'NEW / FRAMEKIT',
      title: 'Design images with **React**',
      description: 'Editable templates for consistent, reusable visual content that is ready to export.',
      website: 'framekit.dev',
    },
  },
  render({ data, locale, width, height }) {
    const accentColor = data.accentColor || '#c8f7d9'
    const labels = locale === 'es'
      ? { define: 'Define', edit: 'Edita', export: 'Exporta', output: 'PNG listo', studio: 'Taller visual' }
      : { define: 'Define', edit: 'Edit', export: 'Export', output: 'PNG ready', studio: 'Visual workshop' }

    return (
      <article
        className="relative flex overflow-hidden bg-[#10271f] text-[#f5f7ee]"
        style={{ width, height }}
      >
        <div className="absolute top-[-260px] right-[-170px] size-[720px] rounded-full border-[110px] opacity-20" style={{ borderColor: accentColor }} />
        <div className="absolute -bottom-100 left-[-300px] size-[780px] rounded-full border border-white/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(200,247,217,0.16),transparent_25%),linear-gradient(135deg,transparent_35%,rgba(3,15,11,0.55))]" />

        <div className="relative z-10 flex size-full flex-col px-[92px] py-[78px]">
          <header className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-[58px] items-center justify-center rounded-[18px] text-[30px] font-black" style={{ backgroundColor: accentColor, color: '#10271f' }}>F</div>
              <div>
                <p className="text-[20px] font-black tracking-[0.14em] uppercase">FrameKit</p>
                <p className="mt-1 text-[12px] font-bold tracking-[0.24em] text-[#91ae9f] uppercase">{labels.studio}</p>
              </div>
            </div>
            <div className="rounded-full border border-white/20 px-5 py-2 text-[12px] font-bold tracking-[0.2em] text-white/65 uppercase">React → PNG</div>
          </header>

          <main className="my-auto grid grid-cols-[1fr_0.8fr] items-center gap-16">
            <BrandHero eyebrow={data.eyebrow} title={data.title} description={data.description} accentColor={accentColor} />

            <div className="relative h-[465px]">
              <div className="absolute top-0 right-0 w-[330px] rounded-[22px] border border-white/15 bg-[#173d31] p-5 shadow-[0_28px_70px_rgba(0,0,0,0.28)]">
                <div className="mb-5 flex items-center justify-between text-[11px] font-bold tracking-[0.18em] text-white/45 uppercase"><span>template.tsx</span><span>01</span></div>
                <div className="space-y-3 font-mono text-[14px] leading-6">
                  <p><span className="text-[#b9f8d2]">defineTemplate</span><span className="text-white/60">({'{'}</span></p>
                  <p className="pl-5 text-white/65">width: <span style={{ color: accentColor }}>1440</span>,</p>
                  <p className="pl-5 text-white/65">fields: <span className="text-[#b9f8d2]">editable</span>,</p>
                  <p className="pl-5 text-white/65">render: <span className="text-[#b9f8d2]">yourDesign</span></p>
                  <p className="text-white/60">{'}'}</p>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 w-[330px] rotate-[-5deg] rounded-[22px] bg-[#f5f7ee] p-5 text-[#10271f] shadow-[0_28px_70px_rgba(0,0,0,0.28)]">
                <div className="flex items-start justify-between">
                  <div><p className="text-[11px] font-black tracking-[0.18em] text-[#537568] uppercase">{labels.output}</p><p className="mt-2 text-[29px] leading-none font-black tracking-[-0.06em]">Your idea,<br />framed.</p></div>
                  <div className="flex size-10 items-center justify-center rounded-xl" style={{ backgroundColor: accentColor }}><span className="text-[18px] font-black">↗</span></div>
                </div>
                <div className="mt-8 flex items-center justify-between border-t border-[#10271f]/15 pt-4 text-[11px] font-bold tracking-[0.12em] text-[#537568] uppercase"><span>1440 × 1440</span><span>PNG</span></div>
              </div>

              <div className="absolute top-[180px] left-[112px] rounded-full border border-white/20 bg-[#10271f] px-4 py-2 text-[11px] font-black tracking-[0.16em] text-white/70 uppercase">{labels.define} · {labels.edit} · {labels.export}</div>
            </div>
          </main>

          <footer className="flex items-end justify-between border-t border-white/15 pt-6">
            <Markdown value={data.website} className="text-[16px] font-bold tracking-[0.08em]" />
            <p className="text-[12px] font-bold tracking-[0.2em] text-white/45 uppercase">Build once · create more</p>
          </footer>
        </div>
      </article>
    )
  },
})
