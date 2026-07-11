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
  RepositoryHealthResponse,
  ProjectChatSettingsResponse,
  ProjectInfrastructureSettingsResponse,
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

export function getProjectChatSettings(token: string, projectId: string) {
  return request<ProjectChatSettingsResponse>({
    path: `/api/v1/projects/${projectId}/settings/chat`,
    token,
  })
}

export function updateProjectChatSettings(
  token: string,
  projectId: string,
  payload: Omit<ProjectChatSettingsResponse, 'projectId'>,
) {
  return request<ProjectChatSettingsResponse>({
    path: `/api/v1/projects/${projectId}/settings/chat`,
    method: 'PATCH',
    token,
    body: payload,
  })
}

export function getProjectInfrastructureSettings(token: string, projectId: string) {
  return request<ProjectInfrastructureSettingsResponse>({
    path: `/api/v1/projects/${projectId}/settings/infrastructure`,
    token,
  })
}

export function updateProjectInfrastructureSettings(
  token: string,
  projectId: string,
  cloudConnectionId: number,
) {
  return request<ProjectInfrastructureSettingsResponse>({
    path: `/api/v1/projects/${projectId}/settings/infrastructure`,
    method: 'PUT',
    token,
    body: { cloudConnectionId },
  })
}

export function clearProjectInfrastructureSettings(token: string, projectId: string) {
  return request<void>({
    path: `/api/v1/projects/${projectId}/settings/infrastructure`,
    method: 'DELETE',
    token,
  })
}
