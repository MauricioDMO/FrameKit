import { defineTemplate, field, Markdown } from '@mauriciodmo/framekit'

export default defineTemplate({
  meta: {
    title: 'Qué es FrameKit',
    description: 'Una introducción visual a FrameKit y su flujo de trabajo.',
    marketingDescription: 'Explicar cómo FrameKit convierte plantillas React en contenido visual reutilizable.',
    tags: ['framekit', 'introducción', 'react']
  },
  width: 1440,
  height: 1440,
  fields: {
    eyebrow: field.text({ label: 'Etiqueta', placeholder: 'NUEVO / FRAMEKIT' }),
    title: field.text({ label: 'Título', placeholder: 'Diseña imágenes desde React' }),
    description: field.text({ label: 'Descripción' }),
    accentColor: field.color({ label: 'Color de acento', defaultValue: '#c8f7d9' })
  },
  content: {
    es: {
      eyebrow: 'NUEVO / FRAMEKIT',
      title: 'Diseña imágenes desde **React**',
      description: 'Plantillas editables para crear contenido visual consistente, reutilizable y listo para exportar.'
    },
    en: {
      eyebrow: 'NEW / FRAMEKIT',
      title: 'Design images with **React**',
      description: 'Editable templates for consistent, reusable visual content that is ready to export.'
    }
  },
  variants: { default: 'es', labels: { es: 'Español', en: 'English' } },
  render ({ data, variant, width, height }) {
    const accentColor = data.accentColor || '#c8f7d9'
    const labels = variant === 'es'
      ? { define: 'Define', edit: 'Edita', export: 'Exporta', output: 'PNG listo', studio: 'Taller visual' }
      : { define: 'Define', edit: 'Edit', export: 'Export', output: 'PNG ready', studio: 'Visual workshop' }

    return (
      <article
        className="relative flex overflow-hidden bg-[#10271f] text-[#f5f7ee]"
        style={{ width, height }}
      >
        <div className="absolute top-[-310px] right-[-220px] size-[760px] rounded-full border-[96px] opacity-15" style={{ borderColor: accentColor }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_77%_18%,rgba(200,247,217,0.14),transparent_24%),linear-gradient(135deg,transparent_32%,rgba(3,15,11,0.58))]" />

        <div className="relative z-10 flex size-full flex-col px-[92px] py-[78px]">
          <header className="flex items-center justify-between border-b border-white/15 pb-6">
            <div className="flex items-center gap-4">
              <div className="flex size-[58px] items-center justify-center rounded-[8px]" style={{ backgroundColor: accentColor }}>
                <span
                  aria-hidden="true"
                  className="size-[40px] bg-current text-black"
                  style={{
                    maskImage: "url('/assets/logos/framekit-small.svg')",
                    maskPosition: 'center',
                    maskRepeat: 'no-repeat',
                    maskSize: 'contain',
                    WebkitMaskImage: "url('/assets/logos/framekit-small.svg')",
                    WebkitMaskPosition: 'center',
                    WebkitMaskRepeat: 'no-repeat',
                    WebkitMaskSize: 'contain'
                  }}
                />
              </div>
              <div>
                <p className="text-[27px] font-black tracking-[0.14em] uppercase">FrameKit</p>
                <p className="mt-1 text-[15px] font-bold tracking-[0.24em] text-[#91ae9f] uppercase">{labels.studio}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[16px] font-bold tracking-[0.2em] text-white/65 uppercase">
              <span className="size-2 rounded-full" style={{ backgroundColor: accentColor }} />
              <span>React → PNG</span>
            </div>
          </header>

          <main className="grid flex-1 grid-cols-[1.08fr_0.92fr] gap-[72px] py-[56px]">
            <div className="flex items-center">
              <section className="max-w-[720px]">
                <Markdown
                  value={data.eyebrow}
                  className="mb-7 text-[19px] font-black tracking-[0.28em] uppercase"
                  style={{ color: accentColor }}
                />
                <Markdown
                  value={data.title}
                  lists
                  className="text-[104px] leading-[0.9] font-medium tracking-[-0.07em]"
                />
                <div className="mt-9 flex items-start gap-5">
                  <span className="mt-3 h-[3px] w-14 shrink-0" style={{ backgroundColor: accentColor }} />
                  <Markdown
                    value={data.description}
                    lists
                    className="max-w-[570px] text-[26px] leading-[1.35] text-white/70"
                  />
                </div>
              </section>
            </div>

            <div className="flex flex-col justify-center border-l border-white/15 pl-[60px]">
              <div className="flex items-center justify-between border-b border-white/15 pb-4 text-[12px] font-bold tracking-[0.2em] text-white/45 uppercase">
                <span>FrameKit / flow</span>
                <span>01 — 03</span>
              </div>

              <div className="mt-5 border border-white/15 bg-[#173d31] p-7">
                <div className="mb-6 flex items-center justify-between text-[12px] font-bold tracking-[0.18em] text-white/45 uppercase">
                  <span>template.tsx</span>
                  <span>React</span>
                </div>
                <div className="space-y-3 font-mono text-[16px] leading-7">
                  <p><span className="text-[#b9f8d2]">defineTemplate</span><span className="text-white/60">({'{'}</span></p>
                  <p className="pl-6 text-white/65">width: <span style={{ color: accentColor }}>1440</span>,</p>
                  <p className="pl-6 text-white/65">fields: <span className="text-[#b9f8d2]">editable</span>,</p>
                  <p className="pl-6 text-white/65">render: <span className="text-[#b9f8d2]">yourDesign</span></p>
                  <p className="text-white/60">{'}'}</p>
                </div>
              </div>

              <div className="mt-5 flex min-h-[250px] flex-col justify-between rounded-[4px] bg-[#f5f7ee] p-7 text-[#10271f]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[12px] font-black tracking-[0.18em] text-[#537568] uppercase">{labels.output}</p>
                    <p className="mt-4 text-[44px] leading-[0.9] font-black tracking-[-0.06em]">Your idea,<br />framed.</p>
                  </div>
                  <div className="flex size-12 items-center justify-center rounded-[8px]" style={{ backgroundColor: accentColor }}>
                    <span className="text-[20px] font-black">↗</span>
                  </div>
                </div>
                <div className="mt-10 flex items-center justify-between border-t border-[#10271f]/15 pt-4 text-[12px] font-bold tracking-[0.12em] text-[#537568] uppercase">
                  <span>1440 × 1440</span>
                  <span>PNG</span>
                </div>
              </div>
            </div>
          </main>

          <div className="grid grid-cols-3 divide-x divide-white/15 border-y border-white/15 py-5">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-[13px] text-[#91ae9f]">01</span>
              <span className="text-[15px] font-black tracking-[0.16em] uppercase">{labels.define}</span>
            </div>
            <div className="flex items-baseline gap-4 pl-6">
              <span className="font-mono text-[13px] text-[#91ae9f]">02</span>
              <span className="text-[15px] font-black tracking-[0.16em] uppercase">{labels.edit}</span>
            </div>
            <div className="flex items-baseline gap-4 pl-6">
              <span className="font-mono text-[13px] text-[#91ae9f]">03</span>
              <span className="text-[15px] font-black tracking-[0.16em] uppercase">{labels.export}</span>
            </div>
          </div>

          <footer className="flex items-end justify-between pt-6">
            <Markdown value="framekit.mauriciodmo.com" className="text-[22px] font-bold tracking-[0.08em]" />
            <p className="text-[16px] font-bold tracking-[0.2em] text-white/45 uppercase">Build once · create more</p>
          </footer>
        </div>
      </article>
    )
  }
})
