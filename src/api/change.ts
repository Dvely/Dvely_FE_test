import { request } from './http'
import type { ChangeDiffResponse, ChangeResponse } from '../types/change'

export function listProjectChanges(token: string, projectId: string) {
  return request<ChangeResponse[]>({ path: `/api/v1/projects/${projectId}/changes`, token })
}

export function getChange(token: string, changeId: string) {
  return request<ChangeResponse>({ path: `/api/v1/changes/${changeId}`, token })
}

export function getChangeDiff(token: string, changeId: string) {
  return request<ChangeDiffResponse>({ path: `/api/v1/changes/${changeId}/diff`, token })
}
