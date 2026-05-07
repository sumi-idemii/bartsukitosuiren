/**
 * microCMS のリスト API 共通スキーマ（drink / food など）。
 * フィールド API 名が異なる場合は各エンドポイント用の型で拡張してください。
 */

/** `menus` リピートフィールドの 1 要素 */
export type MenuEntry = {
  id?: string
  name?: string
  title?: string
  price?: string | number | null
  description?: string | null
}

export type MenuListItem = {
  id: string
  name?: string
  title?: string
  price?: string | number | null
  category?: string | null
  section?: string | null
  description?: string | null
  menus?: MenuEntry[] | null
}
