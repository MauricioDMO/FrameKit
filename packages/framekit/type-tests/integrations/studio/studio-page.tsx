import { createStudioPage } from '@mauriciodmo/framekit/studio/root'
import type { StudioUser } from '@mauriciodmo/framekit/studio'

function StudioClient () {
  return <div />
}

const StudioPage = createStudioPage(StudioClient)

StudioPage({ params: Promise.resolve({ section: 'editor' }) })
StudioPage({ params: Promise.resolve({ section: 'brand', slug: ['catalog', 'hero'] }) })

function OptionalUserClient ({ user }: { user?: StudioUser }) {
  return <div>{user?.username}</div>
}

createStudioPage(OptionalUserClient)

function RequiredUserClient ({ user }: { user: StudioUser }) {
  return <div>{user.username}</div>
}

// @ts-expect-error client components may not require a user
createStudioPage(RequiredUserClient)

function RequiredPropsClient ({ label }: { user?: StudioUser, label: string }) {
  return <div>{label}</div>
}

// @ts-expect-error client components may not require props
createStudioPage(RequiredPropsClient)

function AdminOnlyClient ({ user }: { user?: { id: string, username: string, role: 'admin' } }) {
  return <div>{user?.username}</div>
}

// @ts-expect-error client components must accept every StudioUser
createStudioPage(AdminOnlyClient)

export { StudioPage }
