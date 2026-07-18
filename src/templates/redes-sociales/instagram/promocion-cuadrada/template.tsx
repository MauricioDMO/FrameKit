import { defineTemplate, fields, Markdown } from '@/lib/framekit'

export default defineTemplate({
  width: 1440,
  height: 1440,
  fields: {
    eyebrow: fields.text({ label: 'Etiqueta', placeholder: 'Oferta especial' }),
    title: fields.textarea({ label: 'Título', placeholder: 'Diseñamos tu sitio web' }),
    description: fields.textarea({ label: 'Descripción' }),
    website: fields.text({ label: 'Sitio web' }),
    backgroundImage: fields.url({
      label: 'Imagen de fondo',
      defaultValue: '/images/backgrounds/forest.svg',
    }),
    accentColor: fields.color({ label: 'Color principal', defaultValue: '#b9f8d2' }),
  },
  content: {
    es: {
      language: 'Español',
      eyebrow: 'Estudio digital / 2026',
      title: 'Diseñamos sitios que hacen crecer tu **negocio**',
      description: 'Estrategia, diseño y desarrollo para construir una presencia digital que trabaja a tu favor.',
      website: 'web.mauriciodmo.com',
    },
    en: {
      language: 'English',
      eyebrow: 'Digital studio / 2026',
      title: 'We design websites that grow your **business**',
      description: 'Strategy, design, and development to build a digital presence that works for you.',
      website: 'web.mauriciodmo.com',
    },
  },
  render({ data, locale, width, height }) {
    const accentColor = data.accentColor || '#b9f8d2'
    const labels =
      locale === 'es'
        ? { workshop: 'Taller digital', studio: '01 / Estudio', cta: 'Hablemos' }
        : { workshop: 'Digital workshop', studio: '01 / Studio', cta: 'Let\'s talk' }

    return (
      <article
        className="relative flex overflow-hidden bg-[#071a15] text-white"
        style={{ width, height }}
      >
        {data.backgroundImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.backgroundImage}
            alt=""
            className="absolute inset-0 size-full object-cover opacity-55"
          />
        )}

        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(4,24,18,0.98)_8%,rgba(5,35,26,0.88)_51%,rgba(1,12,9,0.58)_100%)]" />
        <div
          className="absolute -top-44 -right-44 size-[540px] rounded-full border-[100px] opacity-25"
          style={{ borderColor: accentColor }}
        />
        <div className="absolute inset-y-[70px] right-[70px] w-px bg-white/25" />

        <div className="relative z-10 flex size-full flex-col px-19 py-[70px]">
          <header className="flex items-center justify-between pr-9">
            <div className="flex items-center gap-4">
              <span
                className="flex size-12 items-center justify-center rounded-full text-[18px] font-black text-[#092118]"
                style={{ backgroundColor: accentColor }}
              >
                SW
              </span>
              <div>
                <p className="text-[18px] font-black tracking-[0.14em] uppercase">
                  Silver Wolf
                </p>
                <p className="mt-1 text-[12px] tracking-[0.24em] text-white/55 uppercase">
                  {labels.workshop}
                </p>
              </div>
            </div>
            <span className="text-[13px] font-bold tracking-[0.2em] text-white/60 uppercase">
              {labels.studio}
            </span>
          </header>

          <main className="my-auto max-w-[830px]">
            <Markdown
              value={data.eyebrow}
              className="mb-8 block text-[18px] font-bold tracking-[0.3em] uppercase"
              style={{ color: accentColor }}
            />
            <Markdown
              value={data.title}
              lists
              className="text-[82px] leading-[0.94] font-medium tracking-[-0.055em]"
            />
            <div className="mt-10 flex items-start gap-6">
              <span
                className="mt-3 h-[3px] w-16 shrink-0"
                style={{ backgroundColor: accentColor }}
              />
              <Markdown
                value={data.description}
                lists
                className="max-w-[650px] text-[25px] leading-[1.42] text-white/76"
              />
            </div>
          </main>

          <footer className="flex items-end justify-between border-t border-white/20 pt-7 pr-9">
            <Markdown
              value={data.website}
              className="text-[17px] font-bold tracking-[0.08em]"
            />
            <p
              className="rounded-full px-7 py-3 text-[14px] font-black tracking-[0.14em] text-[#092118] uppercase"
              style={{ backgroundColor: accentColor }}
            >
              {labels.cta}
            </p>
          </footer>
        </div>
      </article>
    )
  },
})
