export interface ChangeResponse {
  changeId: number
  projectId: number
  conversationId: number | null
  taskId: string | null
  previewSessionId: string | null
  status: string
  summary: string | null
  createdAt: string
  updatedAt: string
}

export interface ChangeDiffResponse {
  changeId: number
  diff: string
}
