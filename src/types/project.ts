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
