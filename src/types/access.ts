/**
 * microCMS API `access`（店舗情報）想定。
 *
 * できるだけ柔軟に扱うため、次のどちらかで管理できる形にしています:
 * - `rows`: { label, value } の繰り返し（推奨。表示順を制御しやすい）
 * - 既知フィールド（shopName / address / hours...）を個別に持つ
 */

export type AccessRow = {
  id?: string
  label: string
  value: string
  /** リッチテキスト/HTML をそのまま表示したい場合 */
  html?: string
}

export type AccessData = {
  /** 推奨: microCMS のリピートフィールド（label/value） */
  rows?: AccessRow[] | null
  /** 互換: rows 以外の名前で繰り返しを持っている場合 */
  items?: AccessRow[] | null
  infos?: AccessRow[] | null

  /**
   * 現在の microCMS 側の形（例）
   * items: [{ name: "店名", text: "..." }, { name: "アクセス", editor: "<p>...</p>" }]
   */
  items_v2?: Array<{
    fieldId?: string
    id?: string
    name?: string
    text?: string
    editor?: string
  }> | null

  /** 個別フィールド版（命名ゆれ対策で snake_case も許容） */
  shopName?: string | null
  shop_name?: string | null

  address?: string | null
  postalCode?: string | null
  postal_code?: string | null

  hours?: string | null
  businessHours?: string | null
  business_hours?: string | null

  closed?: string | null
  holidays?: string | null
  regularHoliday?: string | null
  regular_holiday?: string | null

  phone?: string | null
  tel?: string | null

  budget?: string | null
  seats?: string | null
  reservation?: string | null
  privateRoom?: string | null
  private_room?: string | null
  charter?: string | null
  cards?: string | null
  smoking?: string | null
  access?: string | null
  parking?: string | null
  nearestStation?: string | null
  nearest_station?: string | null
  other?: string | null
};

