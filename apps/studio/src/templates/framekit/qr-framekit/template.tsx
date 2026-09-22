import { defineTemplate, field } from '@mauriciodmo/framekit'
import { QRCode } from '@mauriciodmo/framekit/qr'

const framekitUrl = 'https://framekit.mauriciodmo.com'

export default defineTemplate({
  meta: {
    title: 'QR de FrameKit',
    description: 'Un codigo QR para visitar la pagina de FrameKit.',
    marketingDescription: 'Presentar FrameKit con un codigo QR listo para escanear.',
    tags: ['framekit', 'qr']
  },
  width: 1200,
  height: 1200,
  fields: {
    website: field.text({
      label: 'URL del sitio',
      required: true,
      defaultValue: framekitUrl,
      minLength: 1,
      maxLength: 2048
    })
  },
  content: {
    es: { website: framekitUrl },
    en: { website: framekitUrl }
  },
  variants: { default: 'es', labels: { es: 'Español', en: 'English' } },
  render ({ data, variant, width, height }) {
    const copy = variant === 'es'
      ? {
          eyebrow: 'Escanea para descubrir',
          title: 'Tu idea,\nenmarcada.',
          description: 'Plantillas React editables para crear contenido visual consistente y listo para exportar.',
          qrLabel: 'Codigo QR para visitar FrameKit',
          footer: 'Construye una vez / crea mas'
        }
      : {
          eyebrow: 'Scan to discover',
          title: 'Your idea,\nframed.',
          description: 'Editable React templates for consistent visual content that is ready to export.',
          qrLabel: 'QR code to visit FrameKit',
          footer: 'Build once / create more'
        }

    return (
      <article
        className="relative flex overflow-hidden bg-[#071a15] text-[#f5f7ee]"
        style={{ width, height }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(185,248,210,0.14),transparent_28%),linear-gradient(135deg,#071a15_0%,#10271f_100%)]" />

        <div className="relative z-10 flex size-full flex-col justify-between px-[92px] py-[78px]">
          <header className="flex items-center justify-between border-b border-white/15 pb-6">
            <p className="text-[27px] font-black tracking-[0.14em] uppercase">FrameKit</p>
            <p className="font-mono text-[15px] tracking-[0.16em] text-[#91ae9f] uppercase">React / QR</p>
          </header>

          <main className="grid grid-cols-[1fr_auto] items-center gap-[88px]">
            <section className="max-w-[620px]">
              <p className="mb-7 text-[19px] font-black tracking-[0.28em] text-[#b9f8d2] uppercase">{copy.eyebrow}</p>
              <h1 className="text-[104px] leading-[0.9] font-medium tracking-[-0.07em] whitespace-pre-line">{copy.title}</h1>
              <p className="mt-9 max-w-[540px] text-[27px] leading-[1.35] text-white/70">
                {copy.description}
              </p>
              <p className="mt-10 font-mono text-[17px] tracking-[0.04em] text-[#b9f8d2]">{data.website}</p>
            </section>

            <QRCode
              value={data.website}
              size={320}
              foreground="#f5f7ee"
              background="transparent"
              qrClassName="block"
              aria-label={copy.qrLabel}
            />
          </main>

          <footer className="flex items-end justify-between border-t border-white/15 pt-6">
            <p className="text-[15px] font-bold tracking-[0.2em] text-white/45 uppercase">{copy.footer}</p>
            <p className="font-mono text-[13px] text-[#91ae9f]">1200 x 1200 / PNG</p>
          </footer>
        </div>
      </article>
    )
  }
})
