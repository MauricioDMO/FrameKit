import { defineTemplate, field, Markdown } from '@mauriciodmo/framekit'
import { SiReact } from '@icons-pack/react-simple-icons'
import { IconSparkles } from '@tabler/icons-react'
import { profile } from '@/profile'

export default defineTemplate({
  meta: {
    title: 'Example template',
    description: 'A starter template for learning the FrameKit workflow.',
    marketingDescription: 'Introduce a message and invite the audience to take the next step.',
    tags: ['starter', 'example'],
  },
  width: 1200,
  height: 800,
  fields: {
    title: field.text({ label: 'Title', required: true, minLength: 1, maxLength: 80 }),
    alignment: field.choice({
      label: 'Alignment',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
      defaultValue: 'center',
    }),
    hero: field.image({ label: 'Hero image', scope: 'common' }),
  },
  content: {
    es: {
      title: 'Tu próxima historia\ncomienza aquí',
      alignment: 'center',
    },
    en: {
      title: 'Your next story\nstarts here',
      alignment: 'center',
    },
  },
  variants: { default: 'en', labels: { es: 'Español', en: 'English' } },
  render({ data, variant, width, height }) {
    return (
      <article
        style={{ width, height }}
        className="flex flex-col justify-center bg-gradient-to-br from-[#10271f] to-[#39775f] p-[72px] text-[#f5fff8]"
      >
        <div className="flex items-center gap-3 text-[#b9f8d2]">
          <IconSparkles className="size-6" stroke={1.8} aria-hidden="true" />
          <SiReact className="size-7" aria-hidden="true" />
          <span className="text-lg tracking-[4px]">{profile.companyName.toUpperCase()} / {variant.toUpperCase()}</span>
        </div>
        <Markdown
          value={data.title}
          className="mt-7 max-w-200 text-[72px] leading-[1.05]"
          style={{ textAlign: data.alignment }}
        />
        {data.hero && <img src={data.hero} alt="" className="mt-9 h-[120px] w-[180px] rounded-[18px] object-cover" />}
        <p className="mt-10 text-xl opacity-75">
          {variant === 'es' ? 'Edita este archivo para crear tu primera plantilla.' : 'Edit this file to create your first template.'}
        </p>
      </article>
    )
  },
})
