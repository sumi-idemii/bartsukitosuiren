import { fetchJson } from './api'

/** microCMS リスト取得 API の一般的な形（API スキーマに合わせてジェネリクスで指定） */
export type MicrocmsListResponse<T> = {
  contents: T[]
  totalCount: number
  offset: number
  limit: number
}

/** Worker プロキシ経由で microCMS のリストを取得（GET /api/cms/{endpoint}） */
export async function fetchMicrocmsList<T>(
  endpoint: string,
  searchParams?: Record<string, string | number | undefined>,
): Promise<MicrocmsListResponse<T>> {
  const path = microcmsRequestPath(endpoint, searchParams)
  return fetchJson<MicrocmsListResponse<T>>(path)
}

/** リスト型エンドポイントの 1 件 GET（例: `blogs/xyz` → getListDetail） */
export async function fetchMicrocmsObject<T>(
  endpointWithId: string,
  searchParams?: Record<string, string | number | undefined>,
): Promise<T> {
  const path = microcmsRequestPath(endpointWithId, searchParams)
  return fetchJson<T>(path)
}

/** オブジェクト型 API（単一オブジェクトのエンドポイント）— Worker 側で `kind=object` → SDK getObject */
export async function fetchMicrocmsSingleton<T>(
  endpoint: string,
  searchParams?: Record<string, string | number | undefined>,
): Promise<T> {
  const path = microcmsRequestPath(endpoint, {
    ...searchParams,
    kind: 'object',
  })
  return fetchJson<T>(path)
}

/**
 * オブジェクト型 API を複数エンドポイントで順に試す（先に存在する API ID に合わせる）
 * 例: `['information', 'access']`
 */
export async function fetchMicrocmsSingletonFirstOk<T>(
  endpoints: readonly [string, ...string[]],
  searchParams?: Record<string, string | number | undefined>,
): Promise<T> {
  let last: unknown
  for (const endpoint of endpoints) {
    try {
      return await fetchMicrocmsSingleton<T>(endpoint, searchParams)
    } catch (e) {
      last = e
    }
  }
  throw last instanceof Error ? last : new Error(String(last))
}

export function microcmsRequestPath(
  endpoint: string,
  searchParams?: Record<string, string | number | undefined>,
): string {
  const clean = endpoint.replace(/^\/+/, '')
  const q = new URLSearchParams()
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) {
      if (v !== undefined) q.set(k, String(v))
    }
  }
  const qs = q.toString()
  return `/api/cms/${clean}${qs ? `?${qs}` : ''}`
}
