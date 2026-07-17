import { request } from './http'
import type {
  ConnectProjectRepositoryPayload,
  CreateProjectPayload,
  UpdateProjectPayload,
  GithubRepositoryResponse,
  ProjectCreateResponse,
  ProjectRepositoryResponse,
  ProjectSummaryResponse,
  ProjectDetailResponse,
  ProjectOverviewResponse,
  ProjectActivityLogResponse,
  ProjectCommitResponse,
  ProjectRepositorySettingsResponse,
  RepositoryHealthResponse,
} from '../types/project'

export function listGithubRepositories(token: string) {
  return request<GithubRepositoryResponse[]>({
    path: '/api/v1/projects/github/repositories',
    token,
  })
}

export function createProject(token: string, payload: CreateProjectPayload) {
  return request<ProjectCreateResponse>({
    path: '/api/v1/projects',
    method: 'POST',
    token,
    body: payload,
  })
}

export function connectProjectRepository(
  token: string,
  projectId: string,
  payload: ConnectProjectRepositoryPayload,
) {
  return request<ProjectRepositoryResponse>({
    path: `/api/v1/projects/${projectId}/repository`,
    method: 'POST',
    token,
    body: payload,
  })
}

export function getProjects(token: string) {
  return request<ProjectSummaryResponse[]>({ path: '/api/v1/projects', token })
}

export function getProject(token: string, projectId: string) {
  return request<ProjectDetailResponse>({
    path: `/api/v1/projects/${projectId}`,
    token,
  })
}

export function updateProject(
  token: string,
  projectId: string,
  payload: UpdateProjectPayload,
) {
  return request<ProjectDetailResponse>({
    path: `/api/v1/projects/${projectId}`,
    method: 'PATCH',
    token,
    body: payload,
  })
}

export function deleteProject(
  token: string,
  projectId: string,
  deleteMode?: string,
) {
  const query = deleteMode ? `?deleteMode=${encodeURIComponent(deleteMode)}` : ''
  return request<void>({
    path: `/api/v1/projects/${projectId}${query}`,
    method: 'DELETE',
    token,
  })
}

export function getProjectOverview(token: string, projectId: string) {
  return request<ProjectOverviewResponse>({
    path: `/api/v1/projects/${projectId}/overview`,
    token,
  })
}

export function getProjectActivityLogs(token: string, projectId: string) {
  return request<ProjectActivityLogResponse[]>({
    path: `/api/v1/projects/${projectId}/activity-logs`,
    token,
  })
}

export function getProjectCommits(token: string, projectId: string) {
  return request<ProjectCommitResponse[]>({
    path: `/api/v1/projects/${projectId}/commits`,
    token,
  })
}

export function getRepositoryHealth(token: string, projectId: string) {
  return request<RepositoryHealthResponse>({
    path: `/api/v1/projects/${projectId}/repository-health`,
    token,
  })
}

export function getRepositorySettings(token: string, projectId: string) {
  return request<ProjectRepositorySettingsResponse>({
    path: `/api/v1/projects/${projectId}/settings/repository`,
    token,
  })
}

// Disconnects the repository binding only — GitHub repo/workflow/Pages are NOT
// deleted, and other domains' state (deployments, domains) is left as-is (natural
// disconnection, not a cascading cleanup). See backend `disconnectRepository` doc.
export function disconnectProjectRepository(token: string, projectId: string) {
  return request<null>({
    path: `/api/v1/projects/${projectId}/repository`,
    method: 'DELETE',
    token,
  })
}
