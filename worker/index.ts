/**
 * 公開サイト用 Worker: 静的アセット以外は `/api/*`。
 * microCMS は公式 SDK（microcms-js-sdk）で取得する。
 */

import { createClient } from 'microcms-js-sdk'
import type { MicroCMSQueries } from 'microcms-js-sdk'

export interface Env {
  MICROCMS_API_KEY: string
  MICROCMS_SERVICE_DOMAIN: string
}

const CMS_PREFIX = '/api/cms/'

/** `//api/...` や末尾 `/` を正規化（URL によっては pathname が `/api` と一致しないことがある） */
function normalizeRequestPathname(pathname: string): string {
  let p = pathname.replace(/\/{2,}/g, '/')
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1)
  return p
}

function normalizeMicrocmsServiceDomain(raw: string): string {
  const t = raw.trim()
  if (!t) return t
  return t.replace(/\.microcms\.io\s*$/i, '').replace(/^https?:\/\//i, '')
}

function isSafeCmsPath(path: string): boolean {
  if (!path || path.includes('..')) return false
  return /^[a-zA-Z0-9/_-]+$/.test(path)
}

/** Worker 専用の `kind` を除き、microCMS の queries に渡す */
function urlSearchParamsToQueries(sp: URLSearchParams): MicroCMSQueries | undefined {
  const q: Record<string, string | number | string[]> = {}
  for (const [key, value] of sp.entries()) {
    if (value === '') continue
    if (key === 'limit' || key === 'offset') {
      const n = parseInt(value, 10)
      if (!Number.isNaN(n)) q[key] = n
      continue
    }
    if (key === 'depth') {
      const n = parseInt(value, 10)
      if (n === 0 || n === 1 || n === 2 || n === 3) q.depth = n
      continue
    }
    if (key === 'fields' && value.includes(',')) {
      q.fields = value.split(',').map((s) => s.trim())
      continue
    }
    if (key === 'ids' && value.includes(',')) {
      q.ids = value.split(',').map((s) => s.trim())
      continue
    }
    q[key] = value
  }
  return Object.keys(q).length ? (q as MicroCMSQueries) : undefined
}

/** ブラウザが別オリジンから /api を叩くとき用（Pages と Worker が別ドメインなど） */
function corsHeaders(request: Request): Headers {
  const h = new Headers()
  const origin = request.headers.get('Origin')
  if (origin) {
    h.set('Access-Control-Allow-Origin', origin)
    h.set('Vary', 'Origin')
  } else {
    h.set('Access-Control-Allow-Origin', '*')
  }
  return h
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url)
    const pathname = normalizeRequestPathname(url.pathname)

    if (request.method === 'OPTIONS' && pathname.startsWith('/api/')) {
      const h = corsHeaders(request)
      h.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
      h.set('Access-Control-Allow-Headers', 'Content-Type, Accept')
      h.set('Access-Control-Max-Age', '86400')
      return new Response(null, { status: 204, headers: h })
    }

    if (!pathname.startsWith('/api/')) {
      return new Response(null, { status: 404 })
    }

    if (pathname === '/api/health' && request.method === 'GET') {
      const h = corsHeaders(request)
      h.set('Content-Type', 'application/json; charset=utf-8')
      return Response.json(
        {
          ok: true,
          service: 'bartsukitosuiren',
          cms: 'microcms-js-sdk',
        },
        { headers: h },
      )
    }

    if (pathname.startsWith(CMS_PREFIX) && request.method === 'GET') {
      const domainRaw = env.MICROCMS_SERVICE_DOMAIN?.trim()
      const apiKey = env.MICROCMS_API_KEY?.trim()
      if (!domainRaw || !apiKey) {
        const h = corsHeaders(request)
        h.set('Content-Type', 'application/json; charset=utf-8')
        return Response.json(
          { error: 'MICROCMS_SERVICE_DOMAIN or MICROCMS_API_KEY is not configured' },
          { status: 503, headers: h },
        )
      }

      const rest = pathname.slice(CMS_PREFIX.length)
      if (!isSafeCmsPath(rest)) {
        const h = corsHeaders(request)
        return Response.json({ error: 'Invalid path' }, { status: 400, headers: h })
      }

      const serviceDomain = normalizeMicrocmsServiceDomain(domainRaw)
      if (!serviceDomain) {
        const h = corsHeaders(request)
        return Response.json({ error: 'Invalid MICROCMS_SERVICE_DOMAIN' }, { status: 503, headers: h })
      }

      const sp = new URLSearchParams(url.searchParams)
      const kind = sp.get('kind')
      sp.delete('kind')
      const queries = urlSearchParamsToQueries(sp)

      const segments = rest.split('/').filter(Boolean)
      if (segments.length === 0) {
        const h = corsHeaders(request)
        return Response.json({ error: 'Invalid path' }, { status: 400, headers: h })
      }

      const client = createClient({ serviceDomain, apiKey })

      try {
        let data: unknown
        if (kind === 'object') {
          if (segments.length !== 1) {
            const h = corsHeaders(request)
            return Response.json({ error: 'object API はエンドポイント 1 セグメントのみです' }, { status: 400, headers: h })
          }
          data = await client.getObject({ endpoint: segments[0], queries })
        } else if (segments.length === 1) {
          data = await client.getList({ endpoint: segments[0], queries })
        } else if (segments.length === 2) {
          data = await client.getListDetail({
            endpoint: segments[0],
            contentId: segments[1],
            queries,
          })
        } else {
          const h = corsHeaders(request)
          return Response.json({ error: 'Invalid path' }, { status: 400, headers: h })
        }

        const h = corsHeaders(request)
        h.set('Content-Type', 'application/json; charset=utf-8')
        h.set('Cache-Control', 'public, max-age=60, s-maxage=300')
        return Response.json(data, { headers: h })
      } catch (err) {
        const h = corsHeaders(request)
        h.set('Content-Type', 'application/json; charset=utf-8')
        const message = err instanceof Error ? err.message : String(err)
        return Response.json({ error: message }, { status: 502, headers: h })
      }
    }

    const h = corsHeaders(request)
    h.set('Content-Type', 'application/json; charset=utf-8')
    return Response.json(
      {
        error: 'not_found',
        hint: '想定パス: GET /api/health または GET /api/cms/{エンドポイントID}',
      },
      { status: 404, headers: h },
    )
  },
} satisfies ExportedHandler<Env>
