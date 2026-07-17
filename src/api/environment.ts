import { request } from './http'
import type {
  CreateEnvironmentVariablePayload,
  EnvironmentScope,
  EnvironmentVariableHistoryResponse,
  EnvironmentVariableResponse,
  UpdateEnvironmentVariablePayload,
} from '../types/environment'

// `scope` is optional server-side (omit for all scopes, sorted scope asc -> key asc).
export function getEnvironmentVariables(
  token: string,
  projectId: string,
  scope?: EnvironmentScope | '',
) {
  const query = scope ? `?scope=${encodeURIComponent(scope)}` : ''
  return request<EnvironmentVariableResponse[]>({
    path: `/api/v1/projects/${projectId}/environment-variables${query}`,
    token,
  })
}

export function createEnvironmentVariable(
  token: string,
  projectId: string,
  payload: CreateEnvironmentVariablePayload,
) {
  return request<EnvironmentVariableResponse>({
    path: `/api/v1/projects/${projectId}/environment-variables`,
    method: 'POST',
    token,
    body: payload,
  })
}

export function updateEnvironmentVariable(
  token: string,
  projectId: string,
  variableId: string,
  payload: UpdateEnvironmentVariablePayload,
) {
  return request<EnvironmentVariableResponse>({
    path: `/api/v1/projects/${projectId}/environment-variables/${variableId}`,
    method: 'PATCH',
    token,
    body: payload,
  })
}

export function deleteEnvironmentVariable(
  token: string,
  projectId: string,
  variableId: string,
) {
  return request<null>({
    path: `/api/v1/projects/${projectId}/environment-variables/${variableId}`,
    method: 'DELETE',
    token,
  })
}

// `limit` is clamped server-side (default 50, max 200) — we just pass through
// whatever the operator typed and let the backend clamp it, per instruction not to
// duplicate validation logic on the console.
export function getEnvironmentVariableHistory(
  token: string,
  projectId: string,
  limit?: string,
) {
  const query = limit ? `?limit=${encodeURIComponent(limit)}` : ''
  return request<EnvironmentVariableHistoryResponse[]>({
    path: `/api/v1/projects/${projectId}/environment-variables/history${query}`,
    token,
  })
}
