async function renderTemplate(element: HTMLDivElement, width: number, height: number) {
  // The screenshot library captures rendered pixels, so fonts must finish loading first.
  await document.fonts.ready
  const { domToPng } = await import('modern-screenshot')

  // Studio scales an ancestor for fit-to-view; capture an untransformed root instead.
  const capture = element.cloneNode(true) as HTMLDivElement
  capture.style.position = 'fixed'
  capture.style.top = '0'
  capture.style.left = '-100000px'
  capture.style.transform = 'none'
  document.body.append(capture)

  try {
    return await domToPng(capture, { width, height, scale: 1 })
  } finally {
    capture.remove()
  }
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
