export interface ConversationResponse {
  conversationId: number
  projectId: number
  // `title`/`projectName` are nullable server-side (the legacy 6-arg constructor
  // path leaves them null), so treat as optional display data, not guaranteed.
  title: string | null
  projectName: string | null
  deleted: boolean
  deletedAt: string | null
  // Only set once the conversation is soft-deleted (trash); null for active
  // conversations. See `ChatTrashPolicy.RETENTION_DAYS` (currently 7 days) for how
  // this is computed from `deletedAt`.
  retentionExpiresAt: string | null
  remainingRetentionDays: number | null
  createdAt: string
  updatedAt: string
}

export interface MessageResponse {
  messageId: number
  conversationId: number
  role: string
  content: string
  tokenCount: number
  createdAt: string
  // Agent task queued alongside this message, when the approval policy accepted it.
  // Null when no task was created (e.g. Decision Agent failed to plan) or when this
  // response comes from a message-history read rather than a fresh send. Poll
  // `GET /agent/tasks/{taskId}` to track it.
  taskId: string | null
}

export interface SendMessagePayload {
  content: string
}
