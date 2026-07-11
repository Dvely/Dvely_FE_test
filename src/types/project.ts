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

export interface ProjectOverviewResponse {
  currentUrl: string | null
  deployStatus: string
  currentVersion: string | null
  repositoryVersion: string | null
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
  relativeTime: string
}

export interface ProjectChatSettingsResponse {
  projectId: number
  changeApprovalRequired: boolean
  deploymentApprovalRequired: boolean
  domainApprovalRequired: boolean
  infraApprovalRequired: boolean
}

export interface ProjectInfrastructureSettingsResponse {
  projectId: number
  cloudConnectionId: number | null
  provider: string | null
  displayName: string | null
  region: string | null
  status: string | null
  lastCheckedAt: string | null
  updatedAt: string | null
}

export interface ProjectDomainSummaryResponse {
  domainId: number
  hostname: string
  url: string | null
  type: string
  hostingTarget: string | null
  status: string
  httpsEnforced: boolean
  certificateStatus: string | null
  certificateExpiresAt: string | null
  lastCheckedAt: string | null
}

export interface ProjectCloudSummaryResponse {
  configured: boolean
  cloudConnectionId: number | null
  provider: string | null
  displayName: string | null
  region: string | null
  status: string | null
  lastCheckedAt: string | null
}

export interface ProjectOperationActionResponse {
  type: string
  available: boolean
  reason: string
}

export interface RepositoryHealthResponse {
  health: string
}
