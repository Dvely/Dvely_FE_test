export type DeployTargetType = 'LATEST' | 'VERSION'

export interface DeployPayload {
  deployTargetType: DeployTargetType
  versionName?: string
}

export interface DeployResponse {
  deploymentId: number
  projectId: number
  deployTargetType: string
  versionName: string | null
  status: string
  pagesUrl: string | null
  createdAt: string
}

export interface VersionResponse {
  versionId: number
  versionName: string
  commitSha: string
  title: string
  deployStatus: string
  mergedAt: string
}

export interface DeploymentCandidateResponse {
  versionId: number
  versionName: string
  commitSha: string
  title: string
  deployStatus: string
  deployedUrl: string | null
  deployedAt: string
}

export interface VersionDetailResponse {
  versionId: number
  versionName: string
  commitSha: string
  title: string
  description: string | null
  deployStatus: string
  deployedUrl: string | null
  mergedBy: string
  mergedByAvatarUrl: string
  prNumber: number | null
  mergedAt: string
}

export interface DeploymentHistoryResponse {
  historyId: number
  projectId: number
  deployTargetType: string
  versionLabel: string | null
  deployedUrl: string | null
  status: string
  triggeredAt: string
  updatedAt: string
}

export interface DeploymentStatusResponse {
  historyId: number
  projectId: number
  deployTargetType: string
  versionLabel: string | null
  deployedUrl: string | null
  status: string
  buildStatus: string | null
  buildConclusion: string | null
  triggeredAt: string
  updatedAt: string
}

export interface DeploymentStepResponse {
  number: number
  name: string
  status: string
  conclusion: string | null
}

export interface DeploymentJobResponse {
  jobId: number
  name: string
  status: string
  conclusion: string | null
  steps: DeploymentStepResponse[]
}

export interface DeploymentLogsResponse {
  historyId: number
  workflowRunId: number | null
  jobs: DeploymentJobResponse[]
  logText: string | null
}

// Backend `AnalysisSource` — which path produced the analysis. RULE_BASED is an
// automatic fallback when the LLM call itself fails, not a separate mode the caller
// chooses.
export type AnalysisSource = 'LLM' | 'RULE_BASED'

export interface DeploymentFailureAnalysisResponse {
  deploymentId: number
  // Non-developer-facing summary (Korean, <= 3 sentences).
  summary: string
  // Excerpt of the originating log, up to 12,000 chars.
  logExcerpt: string
  suggestedFix: string
  analysisSource: AnalysisSource
  analyzedAt: string
}
