import type { TemplateConfig } from '@/lib/templates/types'

const config = {
  title: 'Promoción cuadrada',
  description: 'Publicación cuadrada para promociones de Instagram.',
  order: 10,
  width: 1080,
  height: 1080,
  fileName: 'promocion-instagram',
  fields: [
    {
      key: 'eyebrow',
      label: 'Etiqueta',
      type: 'text',
      placeholder: 'Oferta especial',
    },
    {
      key: 'title',
      label: 'Título',
      type: 'textarea',
      placeholder: 'Diseñamos tu sitio web',
    },
    {
      key: 'description',
      label: 'Descripción',
      type: 'textarea',
    },
    {
      key: 'website',
      label: 'Sitio web',
      type: 'text',
    },
    {
      key: 'backgroundImage',
      label: 'Imagen de fondo',
      type: 'url',
    },
    {
      key: 'accentColor',
      label: 'Color principal',
      type: 'color',
    },
  ],
  defaults: {
    eyebrow: 'Estudio digital / 2026',
    title: 'Diseñamos sitios que hacen crecer tu negocio',
    description:
      'Estrategia, diseño y desarrollo para construir una presencia digital que trabaja a tu favor.',
    website: 'web.mauriciodmo.com',
    backgroundImage: '/images/backgrounds/forest.svg',
    accentColor: '#b9f8d2',
  },
} satisfies TemplateConfig

export default config
