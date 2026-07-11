export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions {
  path: string
  method?: HttpMethod
  token?: string
  body?: unknown
}

export async function request<T>({
  path,
  method = 'GET',
  token,
  body,
}: RequestOptions): Promise<T> {
  const headers: HeadersInit = {}

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const parsedBody = await readBody(response)

  if (!response.ok) {
    const message =
      extractErrorMessage(parsedBody) ?? `Request failed (${response.status})`
    throw new Error(message)
  }

  return unwrapResponse(parsedBody) as T
}

async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null
  }

  const text = await response.text()
  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function unwrapResponse(body: unknown): unknown {
  if (body && typeof body === 'object' && 'data' in body) {
    return (body as { data: unknown }).data
  }
  return body
}

function extractErrorMessage(body: unknown): string | null {
  if (!body || typeof body !== 'object') {
    return null
  }

  const record = body as Record<string, unknown>
  const message = record['message']
  return typeof message === 'string' ? message : null
}
