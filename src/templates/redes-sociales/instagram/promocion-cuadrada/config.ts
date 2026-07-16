import { defineTemplateConfig } from '@/lib/templates/types'

export default defineTemplateConfig({
  order: 10,
  width: 1440,
  height: 1440,
  languages: {
    es: 'Español',
    en: 'English',
  },
  metadata: {
    es: {
      title: 'Promoción cuadrada',
      description: 'Publicación cuadrada para promociones de Instagram.',
      fileName: 'promocion-instagram',
    },
    en: {
      title: 'Square promotion',
      description: 'Square post for Instagram promotions.',
      fileName: 'instagram-promotion',
    },
  },
  fields: [
    {
      key: 'eyebrow',
      type: 'text',
      label: { es: 'Etiqueta', en: 'Label' },
      placeholder: { es: 'Oferta especial', en: 'Special offer' },
    },
    {
      key: 'title',
      type: 'textarea',
      label: { es: 'Título', en: 'Title' },
      placeholder: { es: 'Diseñamos tu sitio web', en: 'We design your website' },
    },
    {
      key: 'description',
      type: 'textarea',
      label: { es: 'Descripción', en: 'Description' },
    },
    {
      key: 'website',
      type: 'text',
      label: { es: 'Sitio web', en: 'Website' },
    },
    {
      key: 'backgroundImage',
      type: 'url',
      label: { es: 'Imagen de fondo', en: 'Background image' },
    },
    {
      key: 'accentColor',
      type: 'color',
      label: { es: 'Color principal', en: 'Primary color' },
    },
  ],
  content: {
    es: {
      eyebrow: 'Estudio digital / 2026',
      title: 'Diseñamos sitios que hacen crecer tu negocio',
      description:
        'Estrategia, diseño y desarrollo para construir una presencia digital que trabaja a tu favor.',
      website: 'web.mauriciodmo.com',
      backgroundImage: '/images/backgrounds/forest.svg',
      accentColor: '#b9f8d2',
    },
    en: {
      eyebrow: 'Digital studio / 2026',
      title: 'We design websites that grow your business',
      description:
        'Strategy, design, and development to build a digital presence that works for you.',
      website: 'web.mauriciodmo.com',
      backgroundImage: '/images/backgrounds/forest.svg',
      accentColor: '#b9f8d2',
    },
  },
})
