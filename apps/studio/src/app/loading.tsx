export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f0eee7] dark:bg-[#17221d]">
      <div
        role="status"
        aria-label="Loading"
        className="size-8 animate-spin rounded-full border-4 border-[#c8f7d9] border-t-[#173d31] dark:border-[#315c49] dark:border-t-[#c8f7d9]"
      />
    </main>
  )
}
