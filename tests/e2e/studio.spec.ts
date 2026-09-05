import { readFile } from 'node:fs/promises'

import { expect, test } from '@playwright/test'

const templateRoute = '/editor/redes-sociales/instagram/promocion-cuadrada'
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const pngHeader = Buffer.from('IHDR')

test('edits and exports a structurally valid PNG through Studio', async ({ page }) => {
  await page.goto(templateRoute)

  await expect(page.getByRole('heading', { name: 'Promoción cuadrada', level: 1, exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Contenido', level: 2, exact: true })).toBeVisible()
  await expect(page.getByText('1440 × 1440', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Metadata', exact: true }).click()
  const metadata = page.getByRole('dialog', { name: 'Promoción cuadrada', exact: true })
  await expect(metadata.getByText('Una pieza cuadrada para comunicar una oferta o servicio en redes sociales.', { exact: true })).toBeVisible()
  await expect(metadata.getByText('Presentar una oferta, destacar sus beneficios y motivar una conversación.', { exact: true })).toBeVisible()
  const tags = metadata.getByRole('list', { name: 'Tags', exact: true })
  await expect(tags.locator(':scope > li')).toHaveText(['instagram', 'social', 'promoción'])
  await metadata.getByRole('button', { name: 'Cerrar', exact: true }).click()

  const preview = page.getByRole('region', { name: 'Vista previa', exact: true })
  const artwork = preview.getByRole('article')
  const backgroundImage = artwork.locator(':scope > img[alt=""]')
  await expect(backgroundImage).toHaveCount(1)
  await expect(backgroundImage).toHaveAttribute('src', '/__framekit/templates/redes-sociales/instagram/promocion-cuadrada/common/backgroundImage.svg')
  await expect.poll(() => backgroundImage.evaluate((image) => {
    const element = image as HTMLImageElement
    return element.complete && element.naturalWidth > 0
  })).toBe(true)

  const variant = page.getByRole('combobox', { name: 'Variante', exact: true })
  await expect(variant).toHaveValue('es')
  await variant.selectOption('en')
  await expect(page.getByRole('textbox', { name: 'Título', exact: true })).toHaveValue('We design websites that grow your **business**')
  await expect(artwork.getByText("Let's talk", { exact: true })).toBeVisible()

  await page.getByRole('textbox', { name: 'Título', exact: true }).fill('Playwright **headline**')
  await page.getByRole('textbox', { name: 'Descripción', exact: true }).fill('A verified browser preview.')
  await expect(artwork.getByText('Playwright headline', { exact: true })).toBeVisible()
  await expect(artwork.getByText('A verified browser preview.', { exact: true })).toBeVisible()

  const opacity = page.getByRole('spinbutton', { name: 'Opacidad de imagen', exact: true })
  await opacity.fill('80')
  await expect(opacity).toHaveValue('80')
  await expect(backgroundImage).toHaveCSS('opacity', '0.8')

  const color = page.getByRole('textbox', { name: 'Color principal', exact: true })
  await color.fill('ff0000')
  await expect(color).toHaveValue('ff0000')
  const cta = artwork.getByText("Let's talk", { exact: true })
  await expect(cta).toHaveCSS('background-color', 'rgb(255, 0, 0)')

  await page.getByRole('combobox', { name: 'Estilo del CTA', exact: true }).selectOption('outline')
  await expect(cta).toHaveClass(/\bborder\b/)

  const showBackgroundImage = page.getByRole('switch', { name: 'Mostrar imagen de fondo', exact: true })
  await showBackgroundImage.press('Space')
  await expect(showBackgroundImage).not.toBeChecked()
  await expect(backgroundImage).toHaveCount(0)
  await showBackgroundImage.press('Space')
  await expect(showBackgroundImage).toBeChecked()
  await expect(backgroundImage).toHaveCount(1)
  await expect(backgroundImage).toHaveCSS('opacity', '0.8')

  await opacity.fill('')
  await expect(opacity).toHaveValue('')
  await expect(page.getByText('Ingresa un número válido', { exact: true })).toBeVisible()
  await expect(backgroundImage).toHaveCSS('opacity', '0.8')
  await expect(artwork.getByText('Playwright headline', { exact: true })).toBeVisible()

  await opacity.fill('60')
  await expect(opacity).toHaveValue('60')
  await expect(page.getByText('Ingresa un número válido', { exact: true })).toHaveCount(0)
  await expect(backgroundImage).toHaveCSS('opacity', '0.6')

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Descargar PNG', exact: true }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('redes-sociales-instagram-promocion-cuadrada.png')
  const downloadPath = await download.path()
  if (!downloadPath) throw new Error('PNG download path is unavailable')

  const png = await readFile(downloadPath)
  expect(png.subarray(0, 8)).toEqual(pngSignature)
  expect(png.subarray(12, 16)).toEqual(pngHeader)
  expect(png.readUInt32BE(16)).toBe(1440)
  expect(png.readUInt32BE(20)).toBe(1440)
})
