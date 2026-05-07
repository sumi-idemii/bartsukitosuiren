import type {
  GalleryItem,
  GalleryPhoto,
  GallerySingleton,
} from '../types/gallery'

/** リストの各コンテンツを「表示用の画像行」に展開（`images[]` または従来の単一画像） */
export function expandGalleryToPhotos(items: GalleryItem[]): GalleryPhoto[] {
  const out: GalleryPhoto[] = []
  for (const item of items) {
    if (Array.isArray(item.images) && item.images.length > 0) {
      item.images.forEach((im, i) => {
        const url = typeof im?.url === 'string' ? im.url.trim() : ''
        if (!url) return
        const alt =
          typeof im.alt === 'string' && im.alt.trim() ? im.alt.trim() : ''
        out.push({
          key: `${item.id}-${i}`,
          src: url,
          alt,
        })
      })
      continue
    }
    const src = galleryImageUrl(item)
    if (src) {
      out.push({
        key: item.id,
        src,
        alt: galleryImageAlt(item),
      })
    }
  }
  return out
}

/** オブジェクト型 API の 1 件から表示用画像行を生成 */
export function expandGallerySingleton(doc: GallerySingleton): GalleryPhoto[] {
  const baseId = typeof doc.id === 'string' && doc.id.trim() ? doc.id.trim() : 'gallery'
  const imgs = doc.images ?? []
  const out: GalleryPhoto[] = []
  imgs.forEach((im, i) => {
    const url = typeof im?.url === 'string' ? im.url.trim() : ''
    if (!url) return
    const alt =
      typeof im.alt === 'string' && im.alt.trim() ? im.alt.trim() : ''
    out.push({
      key: `${baseId}-${i}`,
      src: url,
      alt,
    })
  })
  return out
}

/** ギャラリー 1 件から表示用画像 URL を取得（見つからなければ null） */
export function galleryImageUrl(item: GalleryItem): string | null {
  const img = item.photo ?? item.image ?? item.eyecatch
  if (img && typeof img.url === 'string' && img.url.trim()) return img.url.trim()

  const direct = item.url ?? item.src
  if (typeof direct === 'string' && direct.trim()) return direct.trim()

  return null
}

export function galleryImageAlt(item: GalleryItem): string {
  const a = item.alt ?? item.title
  return typeof a === 'string' && a.trim() ? a.trim() : ''
}
