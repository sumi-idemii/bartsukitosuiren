import type { AccessData, AccessRow } from '../types/access'

/** microCMS `items` の 1 行を AccessPage / フッター共通で表示する */
export function renderAccessRowContent(row: AccessRow) {
  const label = row.label ?? ''
  const value = row.value ?? ''
  const editorHtml = row.html

  if (label.includes('電話') && value) {
    const tel = value.replace(/[^\d+]/g, '')
    if (tel) return <a href={`tel:${tel}`}>{value}</a>
  }

  const valueIsHtml = looksLikeHtml(value)
  if (valueIsHtml && editorHtml) {
    return (
      <div className="stack" style={{ gap: 10 }}>
        <div
          className="accessHtml"
          style={{ width: '100%', overflow: 'hidden' }}
          dangerouslySetInnerHTML={{ __html: value }}
        />
        <div
          className="accessHtml"
          style={{ width: '100%', overflow: 'hidden' }}
          dangerouslySetInnerHTML={{ __html: editorHtml }}
        />
      </div>
    )
  }

  const html = editorHtml || (valueIsHtml ? value : '')
  if (html) {
    return (
      <div
        className="accessHtml"
        style={{ width: '100%', overflow: 'hidden' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }

  return <span style={{ whiteSpace: 'pre-line' }}>{value}</span>
}

export function looksLikeHtml(text: string | null | undefined): boolean {
  if (text == null) return false
  const s = String(text).trimStart()
  return s.length > 0 && s[0] === '<'
}

function trimStr(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

export function microcmsItemToAccessRow(item: {
  name?: string
  text?: string
  editor?: string
}): AccessRow | null {
  const label = typeof item.name === 'string' ? item.name.trim() : ''
  const textRaw = typeof item.text === 'string' ? item.text : ''
  const editorRaw = typeof item.editor === 'string' ? item.editor : ''
  const hasText = textRaw.trim().length > 0
  const hasEditor = editorRaw.trim().length > 0
  if (!label || (!hasText && !hasEditor)) return null

  if (hasText && hasEditor) {
    return { label, value: textRaw, html: editorRaw }
  }
  if (hasText) {
    return { label, value: textRaw }
  }
  return { label, value: editorRaw }
}

/**
 * リピート 1 要素 → AccessRow  
 * - `{ label, value }`（汎用）  
 * - `{ name, text, editor }`（microCMS 現行）
 */
export function repeaterItemToAccessRow(raw: unknown): AccessRow | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const label = trimStr(o.label)
  const value = trimStr(o.value)
  if (label && value) {
    const row: AccessRow = { label, value }
    const id = trimStr(o.id)
    if (id) row.id = id
    return row
  }
  const fromMc = microcmsItemToAccessRow(o as {
    name?: string
    text?: string
    editor?: string
  })
  if (!fromMc) return null
  const id = trimStr(o.id)
  if (id) fromMc.id = id
  return fromMc
}

const FOOTER_INFORMATION_NAMES = ['住所', '営業時間', '定休日', '電話番号'] as const

export function getFooterInformationNames(): readonly string[] {
  return FOOTER_INFORMATION_NAMES
}

/**
 * microCMS の繰り返しフィールドを `rows` / `items` / `infos` / `items_v2` から取得。
 * 空配列 `[]` はスキップする（`??` だと `rows: []` が `items` を潰すため）。
 */
export function firstNonEmptyRepeaterList(data: AccessData | null): unknown[] | null {
  if (!data) return null
  const lists = [data.rows, data.items, data.infos, data.items_v2] as const
  for (const list of lists) {
    if (Array.isArray(list) && list.length > 0) return list as unknown[]
  }
  return null
}

function normalizeItemNameKey(s: string): string {
  return s.trim().normalize('NFKC')
}

/** フッター表示名と API の `name` を突き合わせ（全角半角・結合文字のゆれを吸収） */
function itemNameMatches(want: string, apiName: string): boolean {
  return normalizeItemNameKey(want) === normalizeItemNameKey(apiName)
}

/** 店舗情報オブジェクトの繰り返しから、表示名が一致する行を取得 */
export function findInformationItemRow(
  data: AccessData | null,
  name: string,
): AccessRow | null {
  const rawItems = firstNonEmptyRepeaterList(data)
  if (!rawItems) return null
  const want = name.trim()
  for (const it of rawItems) {
    if (!it || typeof it !== 'object') continue
    const n =
      typeof (it as { name?: string }).name === 'string'
        ? (it as { name: string }).name
        : typeof (it as { label?: string }).label === 'string'
          ? (it as { label: string }).label
          : ''
    if (!n.trim()) continue
    if (itemNameMatches(want, n)) {
      return repeaterItemToAccessRow(it)
    }
  }
  return null
}
