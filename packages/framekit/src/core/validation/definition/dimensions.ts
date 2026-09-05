export function validateDimensions (width: unknown, height: unknown): string | undefined {
  if (
    typeof width !== 'number' ||
    !Number.isFinite(width) ||
    !Number.isInteger(width) ||
    width <= 0
  ) {
    return 'width must be a positive finite integer'
  }

  if (
    typeof height !== 'number' ||
    !Number.isFinite(height) ||
    !Number.isInteger(height) ||
    height <= 0
  ) {
    return 'height must be a positive finite integer'
  }

  return undefined
}
