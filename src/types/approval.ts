export interface ApprovalResponse {
  approvalId: number
  projectId: number
  conversationId: number | null
  taskId: string | null
  type: string
  status: string
  summary: string
  createdAt: string
  decidedAt: string | null
}
