import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { fetchMicrocmsList } from '../lib/microcms'
import type { MenuEntry, MenuListItem } from '../types/menuListItem'
import { Section } from './Section'

function userFacingApiError(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e)
  if (m.includes('Unexpected token') || m.toLowerCase().includes('<!doctype')) {
    return [
      'API が JSON ではなく HTML（ページ）を返しています。',
      '対処例: ① `npm run dev:full` で表示された URL（例: 127.0.0.1:8787）を開く',
      '② または `.env` に VITE_API_BASE_URL=（Worker のオリジン）を設定してから `npm run dev`',
      '③ `.dev.vars` に MICROCMS のキー／ドメインがあるか確認',
    ].join(' ')
  }
  return m
}

function itemLabel(entry: Pick<MenuListItem, 'name' | 'title'>): string {
  const n = entry.name ?? entry.title
  return typeof n === 'string' ? n.trim() : ''
}

function itemPrice(entry: Pick<MenuListItem, 'price'>): string {
  const p = entry.price
  if (p === null || p === undefined) return ''
  if (typeof p === 'number') return `${p.toLocaleString('ja-JP')}円`
  return String(p).trim()
}

function entryLabel(entry: MenuEntry): string {
  const n = entry.name ?? entry.title
  return typeof n === 'string' ? n.trim() : ''
}

function entryPrice(entry: MenuEntry): string {
  const p = entry.price
  if (p === null || p === undefined) return ''
  if (typeof p === 'number') return `${p.toLocaleString('ja-JP')}円`
  return String(p).trim()
}

function groupByCategory(items: MenuListItem[]): Map<string, MenuListItem[]> {
  const map = new Map<string, MenuListItem[]>()
  for (const item of items) {
    const raw = item.category ?? item.section
    const key =
      typeof raw === 'string' && raw.trim() ? raw.trim() : 'その他'
    const list = map.get(key) ?? []
    list.push(item)
    map.set(key, list)
  }
  return map
}

export type MicrocmsMenuListSectionProps = {
  eyebrow: string
  title: string
  /** microCMS の API エンドポイント ID（例: drink, food） */
  endpoint: string
  intro?: ReactNode
  emptyMessage: string
}

export function MicrocmsMenuListSection({
  eyebrow,
  title,
  endpoint,
  intro,
  emptyMessage,
}: MicrocmsMenuListSectionProps) {
  const [items, setItems] = useState<MenuListItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setError(null)

    fetchMicrocmsList<MenuListItem>(endpoint, { limit: 100 })
      .then((res) => {
        if (!cancelled) setItems(res.contents ?? [])
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setItems([])
          setError(userFacingApiError(e))
        }
      })

    return () => {
      cancelled = true
    }
  }, [endpoint])

  const useCategoryGroups = useMemo(() => {
    if (!items?.length) return false
    return items.some((row) => {
      const c = row.category ?? row.section
      return typeof c === 'string' && c.trim().length > 0
    })
  }, [items])

  const grouped = useMemo(() => {
    if (!items?.length || !useCategoryGroups) return null
    return groupByCategory(items)
  }, [items, useCategoryGroups])

  return (
    <div className="stack">
      <Section eyebrow={eyebrow} title={title}>
        {intro ? intro : null}

        {error ? (
          <p className="bodyText" role="alert">
            {error}
          </p>
        ) : null}

        {items === null && !error ? (
          <p className="bodyText">メニューを読み込み中です…</p>
        ) : null}

        {items && items.length === 0 && !error ? (
          <p className="bodyText">{emptyMessage}</p>
        ) : null}

        {items && items.length > 0 && grouped ? (
          <div className="stack" style={{ gap: 28 }}>
            {Array.from(grouped.entries()).map(([category, rows]) => (
              <div key={category}>
                <h2 className="h2">{category}</h2>
                <ul className="menuList">
                  {rows.map((item) => (
                    <MenuItemRow key={item.id} item={item} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}

        {items && items.length > 0 && !useCategoryGroups ? (
          <ul className="menuList">
            {items.map((item) => (
              <MenuItemRow key={item.id} item={item} />
            ))}
          </ul>
        ) : null}
      </Section>
    </div>
  )
}

function MenuItemRow({ item }: { item: MenuListItem }) {
  const menus = item.menus
  if (Array.isArray(menus) && menus.length > 0) {
    return (
      <>
        {menus.map((entry, i) => (
          <MenuEntryRow
            key={entry.id ?? `${item.id}-menu-${i}`}
            entry={entry}
          />
        ))}
      </>
    )
  }

  const label = itemLabel(item)
  const price = itemPrice(item)
  const desc =
    typeof item.description === 'string' ? item.description.trim() : ''

  if (!label && !price && !desc) {
    return null
  }

  return (
    <li>
      <div className="menuRow">
        <span>{label || '—'}</span>
        <span>{price || '—'}</span>
      </div>
      {desc ? (
        <p className="bodyText" style={{ marginTop: 6, marginBottom: 0 }}>
          {desc}
        </p>
      ) : null}
    </li>
  )
}

function MenuEntryRow({ entry }: { entry: MenuEntry }) {
  const label = entryLabel(entry)
  const price = entryPrice(entry)
  const desc =
    typeof entry.description === 'string' ? entry.description.trim() : ''

  if (!label && !price && !desc) {
    return null
  }

  return (
    <li>
      <div className="menuRow">
        <span>{label || '—'}</span>
        <span>{price || '—'}</span>
      </div>
      {desc ? (
        <p className="bodyText" style={{ marginTop: 6, marginBottom: 0 }}>
          {desc}
        </p>
      ) : null}
    </li>
  )
}
