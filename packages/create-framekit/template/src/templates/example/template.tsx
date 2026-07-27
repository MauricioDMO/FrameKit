import { defineTemplate, fields, Markdown } from '@mauriciodmo/framekit'
import { SiReact } from '@icons-pack/react-simple-icons'
import { IconSparkles } from '@tabler/icons-react'

export default defineTemplate({
  width: 1200,
  height: 800,
  fields: {
    title: fields.text({ label: 'Title', required: true }),
    hero: fields.image({ label: 'Hero image', scope: 'common' }),
  },
  content: {
    es: {
      language: 'Español',
      title: 'Tu próxima historia comienza aquí',
    },
    en: {
      language: 'English',
      title: 'Your next story starts here',
    },
  },
  render({ data, locale, width, height }) {
    return (
      <article
        style={{ width, height }}
        className="flex flex-col justify-center bg-gradient-to-br from-[#10271f] to-[#39775f] p-[72px] text-[#f5fff8]"
      >
        <div className="flex items-center gap-3 text-[#b9f8d2]">
          <IconSparkles className="size-6" stroke={1.8} aria-hidden="true" />
          <SiReact className="size-7" aria-hidden="true" />
          <span className="text-lg tracking-[4px]">FRAMEKIT / {locale.toUpperCase()}</span>
        </div>
        <Markdown
          value={data.title}
          className="mt-7 max-w-200 text-[72px] leading-[1.05]"
        />
        {data.hero && <img src={data.hero} alt="" className="mt-9 h-[120px] w-[180px] rounded-[18px] object-cover" />}
        <p className="mt-10 text-xl opacity-75">
          {locale === 'es' ? 'Edita este archivo para crear tu primera plantilla.' : 'Edit this file to create your first template.'}
        </p>
      </article>
    )
  },
})
