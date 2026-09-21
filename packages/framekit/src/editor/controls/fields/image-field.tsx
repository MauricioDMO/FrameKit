import { useEffect, useState } from 'react'

import type { EditorFieldProps } from '@/editor/types'

export function ImageField ({ field, value, error, imageLabels, onImageUpload }: EditorFieldProps) {
  const imageValue = typeof value === 'string' ? value : ''
  const [uploading, setUploading] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const imageErrorId = `${field.key}-image-error`
  const describedBy = [error && `${field.key}-error`, loadFailed && imageErrorId].filter(Boolean).join(' ') || undefined

  useEffect(() => {
    setLoadFailed(false)
  }, [imageValue])

  async function handleChange (event: React.ChangeEvent<HTMLInputElement>) {
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
       <div className="overflow-hidden rounded-xl border border-fk-ivory-400 bg-fk-ivory-200 dark:border-white/15 dark:bg-fk-forest-200">
        {imageValue && !loadFailed
          ? (
          <img src={imageValue} alt="" onError={() => setLoadFailed(true)} className="block max-h-40 w-full object-contain" />
            )
          : (
           <div id={loadFailed ? imageErrorId : undefined} role={loadFailed ? 'alert' : undefined} className="flex min-h-24 items-center justify-center px-3 text-xs text-fk-sage-400 dark:text-fk-sage-200">
            {loadFailed ? imageLabels?.loadError : ''}
          </div>
            )}
      </div>
      {onImageUpload && imageLabels && (
         <label className="relative inline-flex cursor-pointer select-none items-center rounded-lg border border-fk-ivory-400 bg-fk-ivory-100 px-3 py-2 text-xs font-bold text-fk-sage-400 transition hover:bg-fk-ivory-200 has-focus-visible:ring-3 has-focus-visible:ring-fk-mint-300/20 has-focus-visible:outline-none has-disabled:cursor-not-allowed has-disabled:opacity-50 dark:border-white/15 dark:bg-fk-forest-200 dark:text-fk-sage-100 dark:hover:bg-fk-forest-100">
          {uploading ? imageLabels.uploading : imageLabels.select}
          <input id={field.key} name={field.key} type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={uploading} aria-label={field.label} aria-required={field.required} aria-invalid={error !== undefined} aria-describedby={describedBy} onChange={handleChange} className="sr-only" />
        </label>
      )}
    </div>
  )
}
