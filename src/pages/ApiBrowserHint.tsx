import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

/**
 * アドレスバーで /api/* を開いたときに index.html が返り、
 * React が起動して表示される説明用ページ。
 * （アドレスバー経由では Vite が先に index.html を返すため、Worker の生 JSON は表示されないことが多い）
 */
export function ApiBrowserHint() {
  const { pathname } = useLocation()
  const [healthText, setHealthText] = useState<string>('')
  const [healthError, setHealthError] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setHealthError('')
    setHealthText('')

    fetch('/api/health', { headers: { Accept: 'application/json' } })
      .then(async (res) => {
        const body = await res.text()
        if (!cancelled) {
          if (!res.ok) {
            setHealthError(`HTTP ${res.status} — ${body.slice(0, 400)}`)
          } else {
            setHealthText(body)
          }
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setHealthError(e instanceof Error ? e.message : String(e))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="main">
      <div className="container" style={{ padding: '48px 0', maxWidth: '48rem' }}>
        <h1 className="h1" style={{ fontSize: 'clamp(22px, 3vw, 28px)', marginBottom: 16 }}>
          API エンドポイント
        </h1>
        <p className="bodyText">
          いまのパス: <code>{pathname}</code>
        </p>
        <p className="bodyText">
          ブラウザの<strong>アドレスバー</strong>で <code>http://localhost:5173/api/...</code> を開いたときは、多くの場合
          <strong>先に Vite が SPA 用の index.html を返す</strong>ため、アドレスバーでは
          <strong>Worker が返す生の JSON</strong>は見えません（この画面は React が表示しているものです）。
        </p>
        <p className="bodyText">
          一方、ページの中から <code>fetch(&apos;/api/health&apos;)</code> で叩くと、
          <strong>同じオリジン・別経路</strong>のリクエストになるため、下の「動作確認」に
          <strong>Worker が効いていれば JSON</strong>が出ます。
        </p>

        <section style={{ marginTop: 28 }}>
          <h2 className="h2" style={{ fontSize: 'clamp(16px, 2vw, 20px)', marginBottom: 12 }}>
            動作確認（このページから fetch）
          </h2>
          <p className="eyebrow" style={{ marginBottom: 8 }}>
            GET /api/health
          </p>
          {loading ? (
            <p className="bodyText">取得中…</p>
          ) : healthError ? (
            <pre
              className="bodyText"
              style={{
                overflow: 'auto',
                padding: 12,
                borderRadius: 6,
                border: '1px solid var(--hairline-faint, #333)',
                background: 'rgba(0,0,0,0.25)',
              }}
            >
              {healthError}
            </pre>
          ) : (
            <pre
              className="bodyText"
              style={{
                overflow: 'auto',
                padding: 12,
                borderRadius: 6,
                border: '1px solid var(--hairline-faint, #333)',
                background: 'rgba(0,0,0,0.25)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {healthText}
            </pre>
          )}
        </section>

        <p className="bodyText" style={{ marginTop: 24 }}>
          <strong>アドレスバーで JSON そのものを見たいとき:</strong>
        </p>
        <ul className="bodyText" style={{ paddingLeft: '1.25rem' }}>
          <li>
            <code>npm run dev:full</code> で表示される URL（例{' '}
            <code>http://127.0.0.1:8787</code>）のターミナル表示を開き、そのオリジンで{' '}
            <code>/api/health</code> をアドレスバーへ入力
          </li>
          <li>
            ターミナル: <code>curl -sS http://localhost:5173/api/health</code>（または dev:full のポート）
          </li>
        </ul>
        <p className="bodyText" style={{ marginTop: 24 }}>
          <Link to="/">トップへ戻る</Link>
        </p>
      </div>
    </main>
  )
}
