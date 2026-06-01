export type AiProvider = 'ANTHROPIC' | 'OPENAI'

export type AgentType = 'CHAT' | 'CODE' | 'DEPLOY' | 'DOMAIN_BIND'

export type TaskStatus = 'PENDING' | 'RUNNING' | 'WAITING_INPUT' | 'DONE' | 'FAILED'

export interface AgentStep {
  agentType: AgentType
  parameters: Record<string, string>
}

export interface DecisionPayload {
  content: string
  aiProvider: AiProvider
  projectId?: number | null
}

export interface DecisionResponse {
  steps: AgentStep[]
  reasoning: string
  aiProvider: AiProvider
  taskId: string
}

export interface TaskStatusResponse {
  taskId: string
  status: TaskStatus
  previewUrl: string | null
  summary: string | null
  error: string | null
  question: string | null
}

export interface TaskInputPayload {
  value: string
}
