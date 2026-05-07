/**
 * microCMS API `gallery`（リスト）の 1 件想定。
 * 画像フィールドの API 名はプロジェクトで異なるため複数候補を持ちます。
 */

export type MicrocmsImageField = {
  url: string
  width?: number
  height?: number
}

/** リピートフィールドなどで配列になった画像（microCMS の gallery 向け） */
export type GalleryImageEntry = {
  url: string
  height?: number
  width?: number
  alt?: string
}

export type GalleryPhoto = {
  key: string
  src: string
  alt: string
}

/** オブジェクト型 API での単一ドキュメント（`images` のみ等） */
export type GallerySingleton = {
  id?: string
  images?: GalleryImageEntry[]
}

export type GalleryItem = {
  id: string
  /** 画像を複数枚まとめて持つスキーマ */
  images?: GalleryImageEntry[] | null
  /** microCMS の画像フィールド（よくある API 名のどれか） */
  photo?: MicrocmsImageField | null
  image?: MicrocmsImageField | null
  eyecatch?: MicrocmsImageField | null
  /** URL を直接持つスキーマ向け */
  url?: string | null
  src?: string | null
  title?: string | null
  alt?: string | null
}
