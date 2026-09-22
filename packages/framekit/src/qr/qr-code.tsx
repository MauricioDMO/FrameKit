import type { ComponentPropsWithoutRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'

export type QRCodeLevel = 'L' | 'M' | 'Q' | 'H'

export interface QRCodeProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  value: string
  size?: number
  level?: QRCodeLevel
  foreground?: string
  background?: string
  margin?: number
  qrClassName?: string
}

export function QRCode ({
  value,
  size = 128,
  level = 'M',
  foreground = '#000000',
  background = '#ffffff',
  margin = 4,
  qrClassName,
  ...containerProps
}: QRCodeProps) {
  return (
    <div {...containerProps}>
      <QRCodeSVG
        value={value}
        size={size}
        level={level}
        fgColor={foreground}
        bgColor={background}
        marginSize={margin}
        className={qrClassName}
      />
    </div>
  )
}
