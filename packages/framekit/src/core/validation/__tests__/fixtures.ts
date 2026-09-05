export function validDefinition () {
  return {
    meta: { title: 'Valid template' },
    width: 100,
    height: 200,
    fields: {
      title: { kind: 'text', label: 'Title' }
    },
    content: {
      en: { title: 'Hello' }
    },
    variants: { default: 'en', labels: { en: 'English' } },
    render: () => null
  }
}
