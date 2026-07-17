export type AiProvider = 'ANTHROPIC' | 'OPENAI'

export type AgentType = 'CHAT' | 'CODE' | 'DEPLOY' | 'DOMAIN_BIND'

// Backend `TaskStatus` enum (agent/application/dto). Kept in the same order as the
// backend enum. See `TaskStatusResponse.status` schema doc for the meaning of each
// value (WAITING_APPROVAL/QUEUED/RETRY_WAIT/CANCELLED were previously missing here,
// which meant the console rendered those real states as an untyped fallback).
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
  // The conversation this request originated from, so the backend can correlate the
  // resulting Agent task/messages back to the chat thread. Optional: direct
  // (non-chat) submissions to /agent/decision have no conversation.
  conversationId?: number | null
}

export interface DecisionResponse {
  steps: AgentStep[]
  reasoning: string
  aiProvider: AiProvider
  taskId: string
  // Initial task status right after submission (e.g. "WAITING_APPROVAL" when the
  // project's approval policy requires sign-off before execution starts).
  status: string
  // Populated when `status` is WAITING_APPROVAL — approval records to act on via
  // `POST /approvals/{approvalId}/approve|reject`.
  approvalIds: number[]
}

export interface TaskStatusResponse {
  taskId: string
  status: TaskStatus
  previewUrl: string | null
  summary: string | null
  error: string | null
  question: string | null
  // Diagnostic fields populated once a task enters a failure/retry state, so the
  // console can show *why* it failed and whether retrying makes sense — without
  // these, a FAILED task showed nothing but a generic `error` string.
  failureLog: string | null
  suggestedFix: string | null
  attempt: number
  maxAttempts: number
  retryable: boolean
}

export interface TaskInputPayload {
  value: string
}
