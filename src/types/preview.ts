// Types for read-only preview-container observability (backend
// `preview/presentation/dto/response`). Preview sessions themselves are created
// internally by the Agent CODE step (no public "create session" endpoint) — the
// console expects the operator to paste a sessionId obtained from an Agent task's
// `previewUrl`/DB, then just polls status/logs for it.

export interface PreviewResourceUsageResponse {
  memoryUsageBytes: number
  memoryLimitBytes: number
  memoryUsagePercent: number
  cpuPercent: number
}

export interface PreviewContainerStatusResponse {
  sessionId: string
  projectId: number
  taskId: string
  // "ACTIVE" | "CLOSED" | "EXPIRED" — kept as `string` rather than a union since the
  // backend Javadoc lists it inline on the field rather than via a dedicated enum type.
  sessionStatus: string
  containerRunning: boolean
  // null when the container doesn't exist or its OOM status can't be determined.
  oomKilled: boolean | null
  // null while running or when undeterminable.
  exitCode: number | null
  startedAt: string | null
  expiresAt: string
  // Null whenever resource stats aren't available: container not running, OR the
  // one-shot Docker stats sampling took longer than 3s (a real, expected case per the
  // backend contract — render as "수집 실패", not as a loading/error state). Because
  // this endpoint's own p95 is ~1.5s (CPU delta sampling), poll it no more often than
  // every 5s to avoid hammering the Docker daemon.
  resources: PreviewResourceUsageResponse | null
}

export interface PreviewContainerLogsResponse {
  sessionId: string
  containerRunning: boolean
  // stdout+stderr merged, each line Docker-timestamped. May end with a literal
  // "[TRUNCATED] ..." line appended by the backend when the log fetch itself timed
  // out — render `logText` verbatim (including that marker) rather than parsing it.
  // Empty string (not 404) when the container has already been removed.
  logText: string
}
