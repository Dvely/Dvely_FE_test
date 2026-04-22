import type { ApiResponse } from '../types/auth'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080'

async function get<T>(path: string, token?: string): Promise<T> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const response = await fetch(`${API_BASE}${path}`, { headers })
  const body: ApiResponse<T> = await response.json().catch(() => ({
    status: response.status,
    code: 'PARSE_ERROR',
    message: '요청에 실패했습니다.',
    data: null as T,
  }))

  if (!response.ok) {
    throw new Error(body.message ?? '요청에 실패했습니다.')
  }

  return body.data
}

export async function getGithubLoginUrl(): Promise<{ url: string }> {
  return get('/api/v1/auth/github/url')
}

export async function handleGithubCallback(code: string): Promise<{
  accessToken: string
  githubAppInstalled: boolean
}> {
  return get(`/api/v1/auth/github/callback?code=${encodeURIComponent(code)}`)
}

export async function getGithubAppInstallUrl(token: string): Promise<{ url: string }> {
  return get('/api/v1/auth/github/app/install-url', token)
}

export async function handleGithubAppCallback(params: {
  installation_id: string
  setup_action: string
  state: string
}): Promise<void> {
  const query = new URLSearchParams(params).toString()
  const response = await fetch(`${API_BASE}/api/v1/auth/github/app/callback?${query}`, {
    headers: { 'Content-Type': 'application/json' },
  })
  const body: ApiResponse<null> = await response.json().catch(() => ({
    status: response.status,
    code: 'PARSE_ERROR',
    message: '요청에 실패했습니다.',
    data: null,
  }))

  if (!response.ok) {
    throw new Error(body.message ?? '요청에 실패했습니다.')
  }
}
