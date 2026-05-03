export interface CreateProjectPayload {
  name: string
  repositoryMode?: 'create' | 'existing'
  repositoryName?: string
  repositoryFullName?: string
  startMode: string
  templateType?: string
  draftMode: string
  repositoryVisibility: string
}

export interface UpdateProjectPayload {
  name: string
}

export interface ProjectCreateResponse {
  projectId: number
  name: string
  status: string
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
  recentChanges: string[]
  latestCommit: ProjectCommitResponse | null
  trafficSummary: string | null
  repositoryHealth: RepositoryHealthResponse | null
  domainSummary: string | null
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
}

export interface RepositoryHealthResponse {
  health: string
}
