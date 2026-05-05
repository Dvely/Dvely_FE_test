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
