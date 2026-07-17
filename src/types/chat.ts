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
}

export interface SendMessagePayload {
  content: string
}
