export interface ConversationResponse {
  conversationId: number
  projectId: number
  deleted: boolean
  deletedAt: string | null
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
