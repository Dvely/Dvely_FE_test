import { request } from './http'
import type {
  DeployPayload,
  DeployResponse,
  VersionResponse,
  DeploymentCandidateResponse,
  VersionDetailResponse,
  DeploymentHistoryResponse,
  DeploymentStatusResponse,
  DeploymentLogsResponse,
  DeploymentFailureAnalysisResponse,
} from '../types/deployment'

export function deploy(token: string, projectId: string, payload: DeployPayload) {
  return request<DeployResponse>({
    path: `/api/v1/projects/${projectId}/deployments`,
    method: 'POST',
    token,
    body: payload,
  })
}

export function getVersions(token: string, projectId: string) {
  return request<VersionResponse[]>({
    path: `/api/v1/projects/${projectId}/versions`,
    token,
  })
}

export function getDeploymentCandidates(token: string, projectId: string) {
  return request<DeploymentCandidateResponse[]>({
    path: `/api/v1/projects/${projectId}/deployment-candidates`,
    token,
  })
}

export function getVersionDetail(token: string, versionId: string) {
  return request<VersionDetailResponse>({
    path: `/api/v1/versions/${versionId}`,
    token,
  })
}

export function getDeploymentHistories(token: string, projectId: string) {
  return request<DeploymentHistoryResponse[]>({
    path: `/api/v1/projects/${projectId}/deployments`,
    token,
  })
}

export function getDeploymentStatus(token: string, deploymentId: string) {
  return request<DeploymentStatusResponse>({
    path: `/api/v1/deployments/${deploymentId}`,
    token,
  })
}

export function getDeploymentLogs(token: string, deploymentId: string) {
  return request<DeploymentLogsResponse>({
    path: `/api/v1/deployments/${deploymentId}/logs`,
    token,
  })
}

// Re-queues a FAILED deployment as a brand new history row (the failed one is kept
// for audit, not overwritten). 409 if the target isn't currently FAILED.
export function retryDeployment(token: string, deploymentId: string) {
  return request<DeployResponse>({
    path: `/api/v1/deployments/${deploymentId}/retry`,
    method: 'POST',
    token,
  })
}

// Runs (or re-fetches, idempotently) failure-cause analysis for a FAILED deployment.
// A first-time analysis collects GitHub Actions logs and calls an LLM, so this call
// can take ~15-30s — callers should show a spinner/notice, not treat it as hung.
// 409 if the target isn't currently FAILED.
export function analyzeDeploymentFailure(token: string, deploymentId: string) {
  return request<DeploymentFailureAnalysisResponse>({
    path: `/api/v1/deployments/${deploymentId}/failure-analysis`,
    method: 'POST',
    token,
  })
}

// Read-only fetch of a previously computed analysis (no LLM/GitHub calls, so it's
// fast) — 404 if analysis has never been run for this deployment, in which case the
// caller should fall back to `analyzeDeploymentFailure`.
export function getDeploymentFailureAnalysis(token: string, deploymentId: string) {
  return request<DeploymentFailureAnalysisResponse>({
    path: `/api/v1/deployments/${deploymentId}/failure-analysis`,
    token,
  })
}
