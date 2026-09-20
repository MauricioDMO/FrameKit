import { defineTemplate, field, Markdown } from '@mauriciodmo/framekit'

export default defineTemplate({
  meta: {
    title: 'Promoción cuadrada',
    description: 'Una pieza cuadrada para comunicar una oferta o servicio en redes sociales.',
    marketingDescription: 'Presentar una oferta, destacar sus beneficios y motivar una conversación.',
    tags: ['instagram', 'social', 'promoción']
  },
  width: 1440,
  height: 1440,
  fields: {
    eyebrow: field.text({ label: 'Etiqueta', placeholder: 'Oferta especial' }),
    title: field.text({ label: 'Título', placeholder: 'Diseñamos tu sitio web' }),
    description: field.text({ label: 'Descripción' }),
    ctaStyle: field.choice({
      label: 'Estilo del CTA',
      options: [
        { value: 'solid', label: 'Sólido' },
        { value: 'outline', label: 'Contorno' }
      ],
      defaultValue: 'solid'
    }),
    backgroundImage: field.image({
      label: 'Imagen de fondo',
      scope: 'common'
    }),
    showBackgroundImage: field.boolean({ label: 'Mostrar imagen de fondo', defaultValue: true }),
    accentColor: field.color({ label: 'Color principal', defaultValue: '#b9f8d2' })
  },
  content: {
    es: {
      eyebrow: 'Estudio digital / 2026',
      title: 'Diseñamos sitios que hacen crecer tu **negocio**',
      description: 'Estrategia, diseño y desarrollo para construir una presencia digital que trabaja a tu favor.'
    },
    en: {
      eyebrow: 'Digital studio / 2026',
      title: 'We design websites that grow your **business**',
      description: 'Strategy, design, and development to build a digital presence that works for you.'
    }
  },
  variants: { default: 'es', labels: { es: 'Español', en: 'English' } },
  render ({ data, variant, width, height }) {
    const accentColor = data.accentColor || '#b9f8d2'
    const labels =
      variant === 'es'
        ? { workshop: 'Taller visual', studio: '01 / Estudio', cta: 'Hablemos', image: 'Imagen / campaña', channel: 'Instagram / Cuadrada', output: 'Lista para compartir' }
        : { workshop: 'Visual workshop', studio: '01 / Studio', cta: 'Let\'s talk', image: 'Image / campaign', channel: 'Instagram / Square', output: 'Ready to share' }

    return (
      <article
        className="relative flex overflow-hidden bg-[#071a15] text-[#f5f7ee]"
        style={{ width, height }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_34%,rgba(185,248,210,0.09),transparent_28%),linear-gradient(135deg,#071a15_0%,#10271f_100%)]" />
        <div className="absolute top-[-250px] right-[-210px] size-[650px] rounded-full border-[88px] opacity-20" style={{ borderColor: accentColor }} />

        <div className="relative z-10 flex size-full flex-col px-[92px] py-[72px]">
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
                <p className="mt-1 text-[15px] font-bold tracking-[0.24em] text-[#91ae9f] uppercase">{labels.workshop}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[16px] font-bold tracking-[0.2em] text-white/65 uppercase">
              <span className="size-2 rounded-full" style={{ backgroundColor: accentColor }} />
              <span>{labels.studio}</span>
            </div>
          </header>

          <main className="grid flex-1 grid-cols-[1fr_0.88fr] gap-[72px] py-[58px]">
            <section className="flex flex-col justify-center">
              <div className="max-w-[700px]">
                <Markdown
                  value={data.eyebrow}
                  className="mb-7 text-[19px] font-black tracking-[0.28em] uppercase"
                  style={{ color: accentColor }}
                />
                <Markdown
                  value={data.title}
                  lists
                  className="text-[94px] leading-[0.9] font-medium tracking-[-0.07em]"
                />
                <div className="mt-9 flex items-start gap-5">
                  <span className="mt-3 h-[3px] w-14 shrink-0" style={{ backgroundColor: accentColor }} />
                  <Markdown
                    value={data.description}
                    lists
                    className="max-w-[570px] text-[25px] leading-[1.35] text-white/70"
                  />
                </div>
                <div className="mt-10 flex items-center gap-6">
                  <span
                    className={`inline-flex rounded-[8px] px-7 py-4 text-[15px] font-black tracking-[0.14em] uppercase ${data.ctaStyle === 'outline' ? 'border border-white/35 text-white' : 'text-[#092118]'}`}
                    style={data.ctaStyle === 'solid' ? { backgroundColor: accentColor } : undefined}
                  >
                    {labels.cta}
                  </span>
                  <span className="font-mono text-[13px] font-bold tracking-[0.12em] text-[#91ae9f] uppercase">{labels.channel}</span>
                </div>
              </div>
            </section>

            <section className="relative min-h-0 overflow-hidden border border-white/20 bg-[#173d31]">
              {data.showBackgroundImage && data.backgroundImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.backgroundImage}
                  alt=""
                  className="absolute inset-0 size-full object-cover opacity-55"
                />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,26,21,0.3)_0%,rgba(7,26,21,0.12)_42%,rgba(7,26,21,0.96)_100%)]" />
              <div className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: accentColor }} />

              <div className="relative z-10 flex size-full flex-col justify-between p-7">
                <div className="flex items-center justify-between text-[12px] font-bold tracking-[0.18em] text-white/65 uppercase">
                  <span>{labels.image}</span>
                  <span>1440 × 1440</span>
                </div>
                <div>
                  <div className="mb-5 h-px w-16" style={{ backgroundColor: accentColor }} />
                  <p className="text-[12px] font-black tracking-[0.2em] text-[#b9f8d2] uppercase">{labels.output}</p>
                  <p className="mt-3 max-w-[360px] text-[42px] leading-[0.92] font-black tracking-[-0.06em]">{labels.channel}</p>
                </div>
              </div>
            </section>
          </main>

          <footer className="flex items-end justify-between border-t border-white/15 pt-6">
            <Markdown value="framekit.mauriciodmo.com" className="text-[22px] font-bold tracking-[0.08em]" />
            <div className="flex items-center gap-8 text-[15px] font-bold tracking-[0.18em] text-white/45 uppercase">
              <span>{labels.channel}</span>
              <span>Build once · create more</span>
            </div>
          </footer>
        </div>
      </article>
    )
  }
})
