import { getApiBaseUrl } from './env'

type FetchJsonOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  body?: unknown
}

function stripBom(text: string): string {
  return text.replace(/^\uFEFF/, '')
}

/** 有効な JSON は `<` で始まらないため、先頭が `<` なら HTML とみなす */
function looksLikeHtml(text: string): boolean {
  const s = stripBom(text).trimStart()
  return s.length > 0 && s[0] === '<'
}

function parseJsonFromApiResponse<T>(text: string, httpStatus: number): T {
  if (looksLikeHtml(text)) {
    throw new Error(
      [
        'API が JSON ではなく HTML（ページ）を返しました。',
        '多くの場合、/api が Cloudflare Worker に届かず Vite が index.html を返しています。',
        '対処: npm run dev で @cloudflare/vite-plugin が有効か確認する。',
        '別ホストで Worker を動かす場合は .env に VITE_API_BASE_URL を設定する。',
        '（HTTP ' + String(httpStatus) + '）',
      ].join(' '),
    )
  }

  try {
    return JSON.parse(text) as T
  } catch (e) {
    const hint =
      typeof e !== 'undefined' &&
      e !== null &&
      typeof (e as Error).message === 'string' &&
      (e as Error).message.includes('Unexpected token')
        ? '（ブラウザが HTML を JSON と誤認している可能性があります。開発では npm run dev:full を試すか、`.env` に VITE_API_BASE_URL を設定してください）'
        : ''
    throw new Error(
      `JSON の解析に失敗しました（HTTP ${httpStatus}）${hint} 先頭: ${stripBom(text).slice(0, 120).replace(/\s+/g, ' ')}`,
    )
  }
}

export async function fetchJson<T>(path: string, options: FetchJsonOptions = {}) {
  const base = getApiBaseUrl()
  const url = base ? `${base}${path.startsWith('/') ? '' : '/'}${path}` : path

  const res = await fetch(url, {
    method: options.method ?? (options.body ? 'POST' : 'GET'),
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers ?? {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const text = await res.text()

  if (!res.ok) {
    let detail = looksLikeHtml(text)
      ? '（レスポンスが HTML のため省略）'
      : text.slice(0, 600)
    try {
      const j = JSON.parse(text) as { error?: string; hint?: string }
      const parts: string[] = []
      if (typeof j.error === 'string') parts.push(j.error)
      if (typeof j.hint === 'string') parts.push(j.hint)
      if (parts.length) detail = parts.join(' ')
    } catch {
      /* 生テキストのまま */
    }
    throw new Error(`API error: ${res.status} ${res.statusText}${detail ? ` — ${detail}` : ''}`)
  }

  return parseJsonFromApiResponse<T>(text, res.status)
}

