import { useEffect, useState } from 'react'

import type { EditorFieldProps } from '../../types'

export function ImageField({ field, value, error, imageLabels, onImageUpload }: EditorFieldProps) {
  const imageValue = typeof value === 'string' ? value : ''
  const [uploading, setUploading] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    setLoadFailed(false)
  }, [imageValue])

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !onImageUpload) return

    setUploading(true)
    try {
      await onImageUpload(file)
    } catch {
      // The parent renders the field error after an upload failure.
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-xl border border-[#d6d5ce] bg-[#efeee9] dark:border-white/15 dark:bg-[#24342c]">
        {imageValue && !loadFailed ? (
          <img src={imageValue} alt="" onError={() => setLoadFailed(true)} className="block max-h-40 w-full object-contain" />
        ) : (
          <div className="flex min-h-24 items-center justify-center px-3 text-xs text-[#657168] dark:text-[#b8c8be]">
            {loadFailed ? imageLabels?.loadError : field.required ? error : ''}
          </div>
        )}
      </div>
      {onImageUpload && imageLabels && (
        <label className="inline-flex cursor-pointer select-none items-center rounded-lg border border-[#cccec8] bg-white px-3 py-2 text-xs font-bold text-[#4e5a53] transition hover:bg-[#efeee9] has-disabled:cursor-not-allowed has-disabled:opacity-50 dark:border-white/15 dark:bg-[#24342c] dark:text-[#d7e2dc] dark:hover:bg-[#2d4036]">
          {uploading ? imageLabels.uploading : imageLabels.select}
          <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={uploading} onChange={handleChange} className="sr-only" />
        </label>
      )}
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}
