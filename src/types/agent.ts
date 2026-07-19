export type AiProvider = 'ANTHROPIC' | 'OPENAI'

// Backend `AgentType` enum (agent/domain/value) — `INFRA_OPERATE` (CloudOps: natural-
// language infra queries/operations like "서버 상태 보여줘") was missing here even
// though the backend enum already had it before this session's changes.
export type AgentType = 'CHAT' | 'CODE' | 'DEPLOY' | 'DOMAIN_BIND' | 'INFRA_OPERATE'

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
  // Track Z (#56): entered only right after the plan's last CODE step finishes, when
  // the project's `resultApprovalRequired` policy is on — the task is parked here
  // until a human approves/rejects the RESULT approval named by
  // `TaskStatusResponse.pendingApprovalId`. No worker can claim this state (unlike
  // RETRY_WAIT), so polling `GET /agent/tasks/{taskId}` will show it unchanged until
  // that decision is made.
  | 'WAITING_RESULT_APPROVAL'
  | 'DONE'
  | 'FAILED'
  | 'CANCELLED'

// Backend `ApprovalType` enum (approval/domain/value). CHANGE/DEPLOYMENT/
// DOMAIN_BINDING/INFRA_OPERATION all gate *execution* of a still-pending plan step;
// RESULT (#56) is different — it gates reflecting an already-*executed* task's
// preview state into main. Kept here (rather than a dedicated approval API module)
// because this console has no approve/reject screen — see the "10. Agent" section
// hint for the raw `POST /approvals/{id}/approve|reject` call testers run manually.
export type ApprovalType =
  | 'CHANGE'
  | 'DEPLOYMENT'
  | 'DOMAIN_BINDING'
  | 'INFRA_OPERATION'
  | 'RESULT'

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
  // Whether `POST /agent/tasks/{taskId}/retry` would currently succeed (#57): true
  // only when `pendingApprovalId` is null (no approval blocking this task) AND
  // `attempt < maxAttempts`. Once `pendingApprovalId` is set, this is forced false
  // and /retry answers 409 — the approval must be approved/rejected first (approving
  // it is itself what triggers the retry, no separate /retry call needed).
  retryable: boolean
  // PENDING approval currently blocking this task (e.g. the auto-fix-and-rebuild
  // approval BuildFailureRecoveryService creates, or the RESULT approval created by
  // ResultApprovalGate when `status` is WAITING_RESULT_APPROVAL). Null when nothing
  // is blocking. Resolve via `POST /approvals/{pendingApprovalId}/approve|reject`
  // before calling /retry — see `retryable` above.
  pendingApprovalId: number | null
}

export interface TaskInputPayload {
  value: string
}
