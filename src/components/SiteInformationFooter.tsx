import { useEffect, useState } from 'react'
import { fetchMicrocmsSingletonFirstOk } from '../lib/microcms'
import {
  findInformationItemRow,
  getFooterInformationNames,
  renderAccessRowContent,
} from '../lib/informationDisplay'
import type { AccessData } from '../types/access'

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

export function SiteInformationFooter() {
  const [data, setData] = useState<AccessData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setError(null)

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

  const names = getFooterInformationNames()

  return (
    <div className="footerInfo" aria-label="店舗インフォメーション">
      {error ? (
        <p className="footerInfoError bodyText" role="alert">
          {error}
        </p>
      ) : null}

      {names.map((name) => {
        const row = findInformationItemRow(data, name)
        return (
          <div className="footerInfoCol" key={name}>
            <p className="footerInfoHeading">{name}</p>
            <div className="footerInfoBody">
              {data === null && !error ? (
                <span className="footerInfoPlaceholder">…</span>
              ) : row ? (
                renderAccessRowContent(row)
              ) : (
                <span className="footerInfoPlaceholder">—</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
