import { QRCode } from '@mauriciodmo/framekit/qr'
import type { QRCodeLevel, QRCodeProps } from '@mauriciodmo/framekit/qr'

const level: QRCodeLevel = 'H'
const props = {
  value: 'https://framekit.mauriciodmo.com',
  size: 180,
  level,
  className: 'absolute bottom-8 right-8',
  qrClassName: 'size-full',
  'aria-label': 'FrameKit QR code'
} satisfies QRCodeProps

export const renderedQr = <QRCode {...props} />

// @ts-expect-error QR values are text, not numbers.
export const invalidValue = <QRCode value={123} />

// @ts-expect-error Only QR error-correction levels are accepted.
export const invalidLevel = <QRCode value="FrameKit" level="X" />
