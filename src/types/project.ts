export interface CreateProjectPayload {
  name: string
  startMode: string
  templateType?: string
  draftMode: string
}

export interface ConnectProjectRepositoryPayload {
  repositoryMode?: 'create' | 'existing'
  repositoryName?: string
  repositoryFullName?: string
  repositoryVisibility: string
}

export interface UpdateProjectPayload {
  name: string
}

export interface ProjectCreateResponse {
  projectId: number
  name: string
  status: string
  // `POST /projects` also kicks off an initial-code-generation Agent task synchronously
  // with project creation, so the console can surface/track it immediately instead of
  // requiring a separate discovery step.
  taskId: string
  taskStatus: string
  approvalIds: number[]
}

export interface GithubRepositoryResponse {
  fullName: string
  name: string
  owner: string
  description: string | null
  visibility: string
  defaultBranch: string | null
  updatedAt: string | null
}

export interface ProjectRepositoryResponse {
  projectId: number
  repositoryFullName: string
  repositoryVisibility: string
  bindingStatus: string
  repositoryHealth: string
}

export interface ProjectSummaryResponse {
  projectId: number
  name: string
  deployStatus: string
  currentUrl: string | null
  updatedAt: string
  updatedAtRelativeText: string
}

export interface ProjectDetailResponse {
  projectId: number
  name: string
  status: string
  startMode: string
  templateType: string | null
  draftMode: string
  createdAt: string
  updatedAt: string
}

// Overview cloud-connection summary attached to a project (backend
// `ProjectCloudSummaryResponse`). `configured: false` means no cloud connection has
// been selected yet, in which case the remaining fields are null.
export interface ProjectCloudSummaryResponse {
  configured: boolean
  cloudConnectionId: number | null
  provider: string | null
  displayName: string | null
  region: string | null
  status: string | null
  lastCheckedAt: string | null
}

// One operation action offered on the Overview screen (e.g. "redeploy", "connect
// domain"), gated by the project's current state (backend `ProjectOperationActionResponse`).
export interface ProjectOperationActionResponse {
  type: string
  available: boolean
  reason: string
}

// Overview's current-domain summary (backend `ProjectDomainSummaryResponse`). Distinct
// from `DomainResponse` in `types/domainbinding.ts` — this is a read-only projection
// scoped to the Overview screen, null when no domain is connected yet.
export interface ProjectDomainSummaryResponse {
  domainId: number
  hostname: string
  url: string
  type: string
  hostingTarget: string
  status: string
  httpsEnforced: boolean
  certificateStatus: string
  certificateExpiresAt: string | null
  lastCheckedAt: string | null
}

export interface ProjectOverviewResponse {
  currentUrl: string | null
  deployStatus: string
  currentVersion: string | null
  // Latest vN tag synced from the GitHub webhook — independent of `currentVersion`
  // (the deployed version), since the repository can be ahead of what's deployed.
  repositoryVersion: string | null
  // Fixed-size (<= 3) merged feed of Deployment/Change/Approval/Domain events, not
  // plain strings — see `ProjectActivityLogResponse` below.
  recentChanges: ProjectActivityLogResponse[]
  latestCommit: ProjectCommitResponse | null
  repositoryHealth: RepositoryHealthResponse | null
  domainSummary: ProjectDomainSummaryResponse | null
  cloudSummary: ProjectCloudSummaryResponse
  operationActions: ProjectOperationActionResponse[]
}

export interface ProjectActivityLogResponse {
  type: string
  message: string
  occurredAt: string
}

export interface ProjectCommitResponse {
  sha: string
  message: string
  author: string
  committedAt: string
  // Human-readable relative time (e.g. "2시간 전"), pre-formatted server-side.
  relativeTime: string
}

export interface RepositoryHealthResponse {
  health: string
}

// `GET /projects/{projectId}/settings/repository` — always 200, even for a project
// with no repository connected (`connected: false`, and every other repo-specific
// field is null). `defaultBranch` is a live GitHub lookup made on every request (not
// cached), so expect ~500ms added latency, degrading to null on lookup failure.
export interface ProjectRepositorySettingsResponse {
  projectId: number
  connected: boolean
  repositoryFullName: string | null
  repositoryUrl: string | null
  defaultBranch: string | null
  // Unlike the *FullName/*Url/defaultBranch trio above, these three carry the
  // project's persisted default (e.g. "PRIVATE"/"NOT_BOUND"/...) even when
  // `connected` is false — they're never null.
  repositoryVisibility: string
  bindingStatus: string
  repositoryHealth: string
  connectedAt: string | null
  lastSyncedAt: string | null
}

// The four provider-neutral choices that together describe a project's desired
// infrastructure shape (backend `InfrastructureConfiguration` domain record). Always
// sent/received as a complete set of 4 — there's no partial-update variant.
export type DeploymentArchitecture = 'SERVER' | 'CONTAINER' | 'SERVERLESS'
export type ComputeTier = 'MICRO' | 'SMALL' | 'MEDIUM' | 'LARGE'
export type StorageType = 'NONE' | 'OBJECT_STORAGE'
export type NetworkAccess = 'PUBLIC' | 'PRIVATE'

// PUT body — full-document replace, all 4 fields required (no partial update).
export interface UpdateProjectInfrastructureConfigurationPayload {
  deploymentArchitecture: DeploymentArchitecture
  computeTier: ComputeTier
  storageType: StorageType
  networkAccess: NetworkAccess
}

export interface ProjectInfrastructureConfigurationSettings {
  deploymentArchitecture: DeploymentArchitecture
  computeTier: ComputeTier
  storageType: StorageType
  networkAccess: NetworkAccess
  updatedAt: string
}

// A requested configuration change that's currently gated behind an INFRA_OPERATION
// approval — `settings` above stays at its last-applied value until this is decided.
export interface ProjectInfrastructureConfigurationPendingChange {
  changeId: number
  approvalId: number
  action: 'CREATED' | 'UPDATED'
  deploymentArchitecture: DeploymentArchitecture
  computeTier: ComputeTier
  storageType: StorageType
  networkAccess: NetworkAccess
  createdAt: string
}

// GET/PUT `.../settings/infrastructure/configuration` share this exact response
// shape. `configurable: false` (no CONNECTED cloud connection selected yet — see
// section 7 CloudConnection / the older `settings/infrastructure` cloud-connection
// picker) means the PUT below will 409; render the form disabled in that case.
// `settings` is null until the very first successful save.
export interface ProjectInfrastructureConfigurationResponse {
  projectId: number
  configurable: boolean
  settings: ProjectInfrastructureConfigurationSettings | null
  pendingChange: ProjectInfrastructureConfigurationPendingChange | null
}

// One row of `GET .../configuration/history` — includes PENDING_APPROVAL/REJECTED
// entries too (full audit trail), not just applied changes.
export interface ProjectInfrastructureChangeResponse {
  changeId: number
  action: 'CREATED' | 'UPDATED'
  status: 'APPLIED' | 'PENDING_APPROVAL' | 'REJECTED'
  deploymentArchitecture: DeploymentArchitecture
  computeTier: ComputeTier
  storageType: StorageType
  networkAccess: NetworkAccess
  // Null for changes that were applied immediately (no approval gate was needed).
  approvalId: number | null
  actorUserId: number
  createdAt: string
  // Null while still PENDING_APPROVAL.
  decidedAt: string | null
}

// `GET/PATCH /projects/{projectId}/settings/chat` (backend `ProjectChatSettingsResponse`).
// Every project is initialized with all 5 flags on creation — there's no "unset" state.
// `true` on any flag means Agent must not proceed with that category of work until a
// human approves the corresponding Approval record.
export interface ProjectChatSettingsResponse {
  projectId: number
  // CODE (code-change plan) step approval required before execution.
  changeApprovalRequired: boolean
  // DEPLOY step approval required before execution.
  deploymentApprovalRequired: boolean
  // DOMAIN_BIND (connect/disconnect) step approval required before execution.
  domainApprovalRequired: boolean
  // INFRA_OPERATE steps with service/cost impact (e.g. infra config change, preview
  // restart) approval required before execution. Defaults true.
  infraApprovalRequired: boolean
  // Track Z (#56): approval required after a CODE task's preview+diff result is
  // ready, before it's reflected into main. Defaults true. When false, a finished
  // CODE task skips `WAITING_RESULT_APPROVAL` entirely and follows the pre-#56
  // flow (merge happens at deploy time instead) — see `types/agent.ts` `TaskStatus`.
  resultApprovalRequired: boolean
}

// PATCH body — the first 4 fields mirror a full-document replace (all required, no
// partial update), but `resultApprovalRequired` is the one exception: send `null`
// to leave the current value untouched (added in #56 so older console builds that
// don't know this field yet can still PATCH the other 4 without accidentally
// resetting it).
export interface UpdateProjectChatSettingsPayload {
  changeApprovalRequired: boolean
  deploymentApprovalRequired: boolean
  domainApprovalRequired: boolean
  infraApprovalRequired: boolean
  resultApprovalRequired: boolean | null
}

export type CostResourceType = 'COMPUTE' | 'STORAGE' | 'NETWORK'

export type BudgetStatus =
  | 'NO_BUDGET'
  | 'WITHIN_BUDGET'
  | 'OVER_BUDGET'
  | 'NOT_EVALUABLE'

export interface ProjectResourceCostResponse {
  resourceType: CostResourceType
  description: string
  // Backend `BigDecimal`, serialized by Jackson as a plain JSON number (no custom
  // string serializer configured) — treat as `number`, not a numeric string.
  monthlyCost: number
}

export interface ProjectBudgetResponse {
  monthlyBudgetAmount: number
  currency: string
  updatedAt: string
}

// `PUT .../settings/cost-budget` request — upsert, idempotent. `currency` may be
// omitted/undefined (defaults server-side) but if sent must be exactly 'USD' (400
// otherwise — no other currency is supported yet).
export interface UpdateProjectBudgetPayload {
  monthlyBudgetAmount: number
  currency?: string
}

// GET/PUT `.../settings/cost-budget` share this exact response shape. Cost is
// computed on-the-fly on every request (never persisted) from the project's saved
// `InfrastructureConfiguration` — `costAvailable: false` (not 404) when infra hasn't
// been configured yet, or no CONNECTED cloud connection is selected (see section 14
// Infra 설정). All estimation fields degrade to null/[] in that case, and `budget`
// (if one was already set) is still returned since a budget can be set independently
// of infra configuration (design D5).
export interface ProjectCostBudgetResponse {
  projectId: number
  costAvailable: boolean
  provider: 'AWS' | 'GCP' | null
  currency: string
  estimatedMonthlyCost: number | null
  resourceCosts: ProjectResourceCostResponse[]
  // `assumptions`/`priceTableVersion` describe the static price table itself, not a
  // per-project computation — both stay populated even when `costAvailable` is false.
  assumptions: string[]
  priceTableVersion: string
  budget: ProjectBudgetResponse | null
  budgetStatus: BudgetStatus
  budgetUsagePercent: number | null
}
