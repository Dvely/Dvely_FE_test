const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080'

async function get<T>(path: string, token?: string): Promise<T> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const response = await fetch(`${API_BASE}${path}`, { headers })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '요청에 실패했습니다.' }))
    throw new Error(error.message ?? '요청에 실패했습니다.')
  }

  return response.json() as Promise<T>
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
