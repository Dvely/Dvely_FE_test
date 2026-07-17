// Types for the Environment/Secrets domain (backend `environment/presentation/dto`).
// Design rule the whole module hinges on: once a variable is created with
// `secret: true`, its plaintext value is NEVER echoed back in ANY response
// (list/create/update) — `value` is always `null` for secrets, and `secret` can only
// flip false -> true, never back (PATCH with secret:false on an existing secret is a
// 400). The console must render secrets as "설정됨(숨김)" rather than an empty input.

// Backend `EnvironmentScope` enum — deployment target a variable applies to.
// There is intentionally no "COMMON" scope (see backend Javadoc): a value meant for
// both PREVIEW and PRODUCTION must be created twice by the caller.
export type EnvironmentScope = 'PREVIEW' | 'PRODUCTION'

// Backend `EnvironmentVariableAction` enum — kind of change-history event.
export type EnvironmentVariableAction = 'CREATED' | 'UPDATED' | 'DELETED'

export interface CreateEnvironmentVariablePayload {
  key: string
  // NOT optional: backend requires `@NotNull` (empty string "" is a valid value,
  // only `null`/absent is rejected).
  value: string
  scope: EnvironmentScope
  secret: boolean
}

// PATCH semantics mirror the backend `UpdateEnvironmentVariableRequest`: omitting a
// field (or sending `undefined`) means "keep current value/flag" — send an explicit
// `''` to set an empty value. `key`/`scope` are immutable after creation and have no
// fields here at all.
export interface UpdateEnvironmentVariablePayload {
  value?: string
  secret?: boolean
}

export interface EnvironmentVariableResponse {
  environmentVariableId: number
  scope: EnvironmentScope
  key: string
  // Always null when `secret` is true — see module-level note above.
  value: string | null
  secret: boolean
  createdAt: string
  updatedAt: string
}

export interface EnvironmentVariableHistoryResponse {
  historyId: number
  // Nullable: history rows outlive the variable they describe (kept after DELETE).
  environmentVariableId: number | null
  scope: EnvironmentScope
  key: string
  action: EnvironmentVariableAction
  secret: boolean
  // Whether this change actually altered the value (the value itself is never
  // recorded/exposed, by design — only "did it change" is knowable).
  valueChanged: boolean
  actorUserId: number
  createdAt: string
}
