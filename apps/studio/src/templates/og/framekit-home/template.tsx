import { defineTemplate, field, Markdown } from '@mauriciodmo/framekit'

export default defineTemplate({
  meta: {
    title: 'FrameKit Open Graph',
    description: 'Una pieza horizontal para compartir FrameKit en previews sociales.',
    marketingDescription: 'Presentar el flujo de FrameKit desde React hasta una imagen lista para publicar.',
    tags: ['og', 'social', 'framekit']
  },
  width: 1200,
  height: 630,
  fields: {
    eyebrow: field.text({ label: 'Etiqueta' }),
    title: field.text({ label: 'Título' }),
    description: field.text({ label: 'Descripción' })
  },
  content: {
    es: {
      eyebrow: 'REACT / CONTENIDO VISUAL',
      title: 'Diseña una vez.\nGenera tus imágenes.',
      description: 'Convierte componentes React en imágenes consistentes y listas para publicar.'
    },
    en: {
      eyebrow: 'REACT / VISUAL CONTENT',
      title: 'Design once.\nGenerate your images.',
      description: 'Turn React components into consistent images ready to publish.'
    }
  },
  variants: { default: 'es', labels: { es: 'Español', en: 'English' } },
  render ({ data, variant, width, height }) {
    const labels = variant === 'es'
      ? {
          output: 'PNG listo',
          outputTitle: 'Tu idea,\nenmarcada.',
          source: 'template.tsx'
        }
      : {
          output: 'PNG ready',
          outputTitle: 'Your idea,\nframed.',
          source: 'template.tsx'
        }

    return (
      <article
        className="relative flex overflow-hidden bg-[#071a15] text-[#f5f7ee]"
        style={{ width, height }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_12%,rgba(185,248,210,0.1),transparent_25%),linear-gradient(135deg,#071a15_0%,#10271f_100%)]" />
        <div className="absolute -top-63.75 -right-45 size-160 rounded-full border-72 border-[#b9f8d2]/[0.07]" />
        <p className="absolute top-27 left-10.5 text-[9.5rem] leading-none font-black -tracking-widest text-[#f5f7ee]/2.5 uppercase">React</p>

        <div className="relative z-10 flex size-full flex-col px-14 py-9.5">
          <header className="flex items-center justify-between border-b border-white/15 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-11.5 items-center justify-center rounded-md bg-[#c8f7d9]">
                <span
                  aria-hidden="true"
                  className="size-8 bg-current text-[#071a15]"
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
                <p className="text-[19px] font-black tracking-[0.14em] uppercase">FrameKit</p>
              </div>
            </div>
          </header>

          <main className="grid min-h-0 flex-1 grid-cols-[630px_minmax(0,1fr)] gap-4 py-7">
            <section className="flex min-w-0 items-center">
              <div className="max-w-157.5">
                <Markdown
                  value={data.eyebrow}
                  className="mb-7 ml-1 text-[17px] font-black tracking-[0.28em] uppercase"
                  style={{ color: '#c8f7d9' }}
                />
                <Markdown
                  value={data.title}
                  lists
                  className="text-[64px] leading-[0.98] font-medium tracking-[-0.06em]"
                />
                <div className="mt-2 flex items-start gap-5">
                  <span className="mt-3 h-0.5 w-14 shrink-0 bg-[#c8f7d9]" />
                  <Markdown
                    value={data.description}
                    lists
                    className="max-w-125 text-[24px] leading-[1.35] text-white/70"
                  />
                </div>
              </div>
            </section>

            <section className="relative flex min-w-0 flex-col border-white/15 pt-7">
              <p className="relative top-0 text-[20px] font-semibold tracking-[0.18em] text-white/85 uppercase">React → PNG</p>

              <div className="relative z-10 flex min-h-62.5 -rotate-3 flex-col justify-between border border-[#10271f]/15 bg-[#f5f7ee] p-8 text-[#10271f] shadow-2xl shadow-black/25">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[12px] font-black tracking-[0.18em] text-[#537568] uppercase">{labels.output}</p>
                    <p className="mt-5 text-[52px] leading-[0.9] font-black tracking-[-0.06em] whitespace-pre-line">{labels.outputTitle}</p>
                  </div>
                  <div className="flex size-11 items-center justify-center rounded-md bg-[#c8f7d9] text-[20px] font-black">↗</div>
                </div>
              </div>

              <div className="absolute bottom-7.5 -left-6.5 z-10 w-47 border border-white/15 bg-[#173d31] px-3 py-2 font-mono text-[10px] leading-4 text-white/70 shadow-xl shadow-black/20">
                <p className="mb-1 text-[9px] font-bold tracking-[0.16em] text-white/45 uppercase">{labels.source}</p>
                <p><span className="text-[#b9f8d2]">defineTemplate</span><span className="text-white/45">{'{'}</span></p>
                <p className="pl-3">render: <span className="text-[#b9f8d2]">yourDesign</span></p>
                <p className="text-white/45">{'}'}</p>
              </div>
            </section>
          </main>
        </div>
      </article>
    )
  }
})
