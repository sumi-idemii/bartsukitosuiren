import { useEffect, useState } from 'react'
import {
  expandGallerySingleton,
  expandGalleryToPhotos,
} from '../lib/galleryImage'
import { fetchMicrocmsList, fetchMicrocmsSingleton } from '../lib/microcms'
import type { GalleryItem, GalleryPhoto, GallerySingleton } from '../types/gallery'
import { Section } from '../ui/Section'

function userFacingApiError(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e)
  if (m.includes('Unexpected token') || m.toLowerCase().includes('<!doctype')) {
    return [
      'API が JSON ではなく HTML（ページ）を返しています。',
      '対処例: `.env` に VITE_API_BASE_URL を設定する、`npm run dev:full` を試す、`.dev.vars` を確認。',
    ].join(' ')
  }
  return m
}

export function GalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setError(null)

    async function load() {
      try {
        const res = await fetchMicrocmsList<GalleryItem>('gallery', {
          limit: 100,
        })
        if (cancelled) return
        let next = expandGalleryToPhotos(res.contents ?? [])
        if (next.length === 0) {
          const doc = await fetchMicrocmsSingleton<GallerySingleton>('gallery')
          if (cancelled) return
          next = expandGallerySingleton(doc)
        }
        if (!cancelled) setPhotos(next)
      } catch (e: unknown) {
        if (cancelled) return
        try {
          const doc = await fetchMicrocmsSingleton<GallerySingleton>('gallery')
          if (cancelled) return
          setPhotos(expandGallerySingleton(doc))
          setError(null)
        } catch {
          setPhotos([])
          setError(userFacingApiError(e))
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="stack">
      <Section eyebrow="GALLERY" title="Photos">
        {error ? (
          <p className="bodyText" role="alert">
            {error}
          </p>
        ) : null}

        {photos === null && !error ? (
          <p className="bodyText">ギャラリーを読み込み中です…</p>
        ) : null}

        {photos !== null && photos.length === 0 && !error ? (
          <p className="bodyText">表示できる写真がありません。</p>
        ) : null}

        {photos !== null && photos.length > 0 ? (
          <div className="galleryGrid" aria-label="ギャラリー">
            {photos.map((row, i) => {
              const label = row.alt || `写真 ${i + 1} を開く`
              return (
                <a
                  key={row.key}
                  className="galleryPhoto"
                  href={row.src}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                >
                  <img
                    className="galleryImg"
                    src={row.src}
                    alt={row.alt}
                    loading="lazy"
                  />
                </a>
              )
            })}
          </div>
        ) : null}
      </Section>
    </div>
  )
}
