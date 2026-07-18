export async function exportTemplate(element: HTMLDivElement, slug: string, width: number, height: number) {
  // The screenshot library captures rendered pixels, so fonts must finish loading first.
  await document.fonts.ready
  const { domToPng } = await import('modern-screenshot')
  const image = await domToPng(element, { width, height, scale: 1 })
  const link = document.createElement('a')
  link.href = image
  link.download = `${slug.replaceAll('/', '-')}.png`
  link.click()
}
