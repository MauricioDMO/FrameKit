import { readFile } from 'node:fs/promises'

import { expect, test } from '@playwright/test'

const templateRoute = '/editor/redes-sociales/instagram/promocion-cuadrada'
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

test('edits and exports promocion-cuadrada through Studio', async ({ page }) => {
  await page.goto(templateRoute)

  await expect(page.getByRole('heading', { name: 'Promoción cuadrada', level: 1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Contenido', level: 2 })).toBeVisible()
  await expect(page.getByText('1440 × 1440', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Metadata' }).click()
  const metadata = page.getByRole('dialog', { name: 'Promoción cuadrada' })
  await expect(metadata).toContainText('Una pieza cuadrada para comunicar una oferta o servicio en redes sociales.')
  await expect(metadata).toContainText('Presentar una oferta, destacar sus beneficios y motivar una conversación.')
  const tags = metadata.getByRole('list', { name: 'Tags' })
  for (const tag of ['instagram', 'social', 'promoción']) await expect(tags).toContainText(tag)
  await metadata.getByRole('button', { name: 'Cerrar' }).click()

  const preview = page.getByRole('region', { name: 'Vista previa' })
  const artwork = preview.getByRole('article')
  const backgroundImage = artwork.locator(':scope > img')

  const variant = page.getByRole('combobox', { name: 'Variante' })
  await expect(variant).toHaveValue('es')
  await variant.selectOption('en')
  await expect(page.getByRole('textbox', { name: 'Título' })).toHaveValue('We design websites that grow your **business**')
  await expect(artwork).toContainText("Let's talk")

  await page.getByRole('textbox', { name: 'Título' }).fill('Playwright **headline**')
  await page.getByRole('textbox', { name: 'Descripción' }).fill('A verified browser preview.')
  await expect(artwork).toContainText('Playwright headline')
  await expect(artwork).toContainText('A verified browser preview.')

  const opacity = page.getByRole('spinbutton', { name: 'Opacidad de imagen' })
  await opacity.fill('80')
  await expect(opacity).toHaveValue('80')
  await expect(backgroundImage).toHaveCSS('opacity', '0.8')

  const color = page.getByRole('textbox', { name: 'Color principal', exact: true })
  await color.fill('ff0000')
  await expect(color).toHaveValue('ff0000')
  const cta = artwork.locator('p').filter({ hasText: "Let's talk" })
  await expect(cta).toHaveCSS('background-color', 'rgb(255, 0, 0)')

  await page.getByRole('combobox', { name: 'Estilo del CTA' }).selectOption('outline')
  await expect(cta).toHaveClass(/border/)

  const showBackgroundImage = page.getByRole('switch', { name: 'Mostrar imagen de fondo' })
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
  await expect(artwork).toContainText('Playwright headline')

  await opacity.fill('60')
  await expect(opacity).toHaveValue('60')
  await expect(page.getByText('Ingresa un número válido', { exact: true })).toHaveCount(0)
  await expect(backgroundImage).toHaveCSS('opacity', '0.6')

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Descargar PNG' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('redes-sociales-instagram-promocion-cuadrada.png')
  const downloadPath = await download.path()
  if (!downloadPath) throw new Error('PNG download path is unavailable')

  const png = await readFile(downloadPath)
  expect(png.length).toBeGreaterThan(24)
  expect(png.subarray(0, 8).equals(pngSignature)).toBe(true)
  expect(png.readUInt32BE(16)).toBe(1440)
  expect(png.readUInt32BE(20)).toBe(1440)
})
