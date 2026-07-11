export type AiProvider = 'ANTHROPIC' | 'OPENAI'

export type AgentType = 'CHAT' | 'CODE' | 'DEPLOY' | 'DOMAIN_BIND'

export type TaskStatus =
  | 'PENDING'
  | 'WAITING_APPROVAL'
  | 'QUEUED'
  | 'RETRY_WAIT'
  | 'RUNNING'
  | 'WAITING_INPUT'
  | 'DONE'
  | 'FAILED'
  | 'CANCELLED'

export interface AgentStep {
  agentType: AgentType
  parameters: Record<string, string>
}

export interface DecisionPayload {
  content: string
  aiProvider: AiProvider
  projectId?: number | null
  conversationId?: number | null
}

export interface DecisionResponse {
  steps: AgentStep[]
  reasoning: string
  aiProvider: AiProvider
  taskId: string
  status: TaskStatus
  approvalIds: number[]
}

export interface TaskStatusResponse {
  taskId: string
  status: TaskStatus
  previewUrl: string | null
  summary: string | null
  error: string | null
  question: string | null
  failureLog: string | null
  suggestedFix: string | null
  attempt: number
  maxAttempts: number
  retryable: boolean
}

export interface AgentTaskEventResponse {
  eventId: number
  taskId: string
  type: string
  status: TaskStatus | null
  message: string | null
  createdAt: string
}

export interface TaskInputPayload {
  value: string
}
