import { useEffect, useMemo, useState } from 'react'
import {
  firstNonEmptyRepeaterList,
  renderAccessRowContent,
  repeaterItemToAccessRow,
} from '../lib/informationDisplay'
import { fetchMicrocmsSingletonFirstOk } from '../lib/microcms'
import type { AccessData, AccessRow } from '../types/access'
import { Section } from '../ui/Section'

export function AccessPage() {
  const [data, setData] = useState<AccessData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setError(null)
    setData(null)

    fetchMicrocmsSingletonFirstOk<AccessData>(['information', 'access'])
      .then((res) => {
        if (!cancelled) setData(res)
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(userFacingApiError(e))
      })

    return () => {
      cancelled = true
    }
  }, [])

  const rows = useMemo(() => resolveAccessRows(data), [data])

  return (
    <div className="stack">
      <Section eyebrow="ACCESS" title="Store Info">
        {error ? (
          <p className="bodyText" role="alert">
            {error}
          </p>
        ) : null}

        {data === null && !error ? <p className="bodyText">店舗情報を読み込み中です…</p> : null}

        {data !== null && rows.length === 0 && !error ? (
          <p className="bodyText">表示できる店舗情報がありません。</p>
        ) : null}

        {data !== null && rows.length > 0 ? (
          <dl className="dl">
            {rows.map((row, i) => (
              <div className="dlRow" key={row.id ?? `access-row-${i}`}>
                <dt>{row.label}</dt>
                <dd>{renderAccessRowContent(row)}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </Section>
    </div>
  )
}

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

function asNonEmptyString(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

function resolveAccessRows(data: AccessData | null): AccessRow[] {
  if (!data) return []

  /** microCMS の繰り返し（空の `rows: []` で `items` が無視されないようにする） */
  const rawList = firstNonEmptyRepeaterList(data)
  if (rawList) {
    const rows: AccessRow[] = []
    for (const raw of rawList) {
      const row = repeaterItemToAccessRow(raw)
      if (row) rows.push(row)
    }
    if (rows.length > 0) return rows
  }

  // 最後のフォールバック: どのフィールド名でも、文字列として入っているものをそのまま表示する
  // （microCMS のフィールド API 名が想定と違っても、とりあえず内容が見えるようにする）
  const ignoredKeys = new Set([
    'id',
    'createdAt',
    'updatedAt',
    'publishedAt',
    'revisedAt',
    'rows',
    'items',
    'infos',
    'items_v2',
  ])
  const fallback: AccessRow[] = []
  for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
    if (ignoredKeys.has(k)) continue
    const s = asNonEmptyString(v)
    if (s) {
      fallback.push({ label: k, value: s })
      continue
    }
    // ありがちな形: { text: "..." } / { value: "..." }
    if (v && typeof v === 'object') {
      const t = asNonEmptyString((v as Record<string, unknown>).text)
      if (t) {
        fallback.push({ label: k, value: t })
        continue
      }
      const vv = asNonEmptyString((v as Record<string, unknown>).value)
      if (vv) {
        fallback.push({ label: k, value: vv })
        continue
      }
    }
  }
  return fallback
}

