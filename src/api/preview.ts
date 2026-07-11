import { request } from './http'

export function closePreviewSession(token: string, sessionId: string) {
  return request<void>({
    path: `/api/v1/preview-sessions/${sessionId}`,
    method: 'DELETE',
    token,
  })
}
