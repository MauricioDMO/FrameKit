import { defineTemplate, fields, Markdown } from '@mauriciodmo/framekit'

export default defineTemplate({
  width: 1200,
  height: 800,
  fields: {
    title: fields.text({ label: 'Titulo', required: true }),
  },
  content: {
    es: {
      language: 'Espanol',
      title: 'Tu proxima historia empieza aqui',
    },
    en: {
      language: 'English',
      title: 'Your next story starts here',
    },
  },
  render({ data, locale, width, height }) {
    return (
      <article style={{ width, height, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 72, background: 'linear-gradient(135deg, #10271f, #39775f)', color: '#f5fff8' }}>
        <p style={{ margin: 0, color: '#b9f8d2', fontSize: 18, letterSpacing: 4 }}>FRAMEKIT / {locale.toUpperCase()}</p>
        <Markdown value={data.title} style={{ marginTop: 28, maxWidth: 800, fontSize: 72, lineHeight: 1.05 }} />
      </article>
    )
  },
})
