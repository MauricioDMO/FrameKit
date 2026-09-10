import { createStudioPage } from '@mauriciodmo/framekit/studio/root'

function StudioClient () {
  return <div />
}

const StudioPage = createStudioPage(StudioClient)

StudioPage({ params: Promise.resolve({ section: 'editor' }) })
StudioPage({ params: Promise.resolve({ section: 'brand', slug: ['catalog', 'hero'] }) })

function OptionalPropsClient ({ label }: { label?: string }) {
  return <div>{label}</div>
}

createStudioPage(OptionalPropsClient)

function RequiredPropsClient ({ label }: { label: string }) {
  return <div>{label}</div>
}

// @ts-expect-error client components may not require props
createStudioPage(RequiredPropsClient)

export { StudioPage }
