async function renderTemplate(element: HTMLDivElement, width: number, height: number) {
  // The screenshot library captures rendered pixels, so fonts must finish loading first.
  await document.fonts.ready
  const { domToPng } = await import('modern-screenshot')
  return domToPng(element, { width, height, scale: 1 })
}

export async function exportTemplate(element: HTMLDivElement, slug: string, width: number, height: number) {
  const image = await renderTemplate(element, width, height)
  const link = document.createElement('a')
  link.href = image
  link.download = `${slug.replaceAll('/', '-')}.png`
  link.click()
}

export async function copyTemplate(element: HTMLDivElement, width: number, height: number) {
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
    throw new Error('Image clipboard support is unavailable')
  }

  const image = await renderTemplate(element, width, height)
  const blob = await (await fetch(image)).blob()
  await navigator.clipboard.write([new ClipboardItem({ [blob.type || 'image/png']: blob })])
}
