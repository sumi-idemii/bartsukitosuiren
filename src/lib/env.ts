export function getApiBaseUrl() {
  const url = import.meta.env.VITE_API_BASE_URL as string | undefined
  return url?.replace(/\/+$/, '') ?? ''
}

