export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8 lg:min-h-screen">
      <div
        role="status"
        aria-label="Loading"
        className="size-8 animate-spin rounded-full border-4 border-[#c8f7d9] border-t-[#173d31] dark:border-[#315c49] dark:border-t-[#c8f7d9]"
      />
    </div>
  )
}
