import { request } from './http'
import type { ApprovalResponse } from '../types/approval'

export function listProjectApprovals(token: string, projectId: string) {
  return request<ApprovalResponse[]>({ path: `/api/v1/projects/${projectId}/approvals`, token })
}

export function getApproval(token: string, approvalId: string) {
  return request<ApprovalResponse>({ path: `/api/v1/approvals/${approvalId}`, token })
}

export function approve(token: string, approvalId: string) {
  return request<ApprovalResponse>({ path: `/api/v1/approvals/${approvalId}/approve`, method: 'POST', token })
}

export function reject(token: string, approvalId: string) {
  return request<ApprovalResponse>({ path: `/api/v1/approvals/${approvalId}/reject`, method: 'POST', token })
}
