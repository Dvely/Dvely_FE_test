import { request } from './http'
import type {
  PreviewContainerLogsResponse,
  PreviewContainerStatusResponse,
} from '../types/preview'

export function getPreviewSessionStatus(token: string, sessionId: string) {
  return request<PreviewContainerStatusResponse>({
    path: `/api/v1/preview-sessions/${sessionId}/status`,
    token,
  })
}

// `tail`/`sinceSeconds` are both optional and clamped server-side (tail defaults to
// 200, clamped to [1, 2000]; sinceSeconds floored at 0) — passed through as-is.
export function getPreviewSessionLogs(
  token: string,
  sessionId: string,
  tail?: string,
  sinceSeconds?: string,
) {
  const params = new URLSearchParams()
  if (tail) params.set('tail', tail)
  if (sinceSeconds) params.set('sinceSeconds', sinceSeconds)
  const query = params.toString() ? `?${params.toString()}` : ''
  return request<PreviewContainerLogsResponse>({
    path: `/api/v1/preview-sessions/${sessionId}/logs${query}`,
    token,
  })
}
