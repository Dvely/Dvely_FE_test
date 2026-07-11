import { request } from './http'
import type {
  CloudConnectionHealthResponse,
  CloudConnectionResponse,
  CreateCloudConnectionPayload,
  CreateCloudConnectionResponse,
  CloudConnectionVerificationJobResponse,
} from '../types/cloudconnection'

export function listCloudConnections(token: string) {
  return request<CloudConnectionResponse[]>({
    path: '/api/v1/cloud-connections',
    token,
  })
}

export function requestCloudConnectionVerification(token: string, cloudConnectionId: string) {
  return request<CloudConnectionVerificationJobResponse>({
    path: `/api/v1/cloud-connections/${cloudConnectionId}/verification-jobs`,
    method: 'POST',
    token,
  })
}

export function getCloudConnectionVerificationJob(token: string, jobId: string) {
  return request<CloudConnectionVerificationJobResponse>({
    path: `/api/v1/cloud-connection-verification-jobs/${jobId}`,
    token,
  })
}

export function createCloudConnection(
  token: string,
  payload: CreateCloudConnectionPayload,
) {
  return request<CreateCloudConnectionResponse>({
    path: '/api/v1/cloud-connections',
    method: 'POST',
    token,
    body: payload,
  })
}

export function getCloudConnection(token: string, cloudConnectionId: string) {
  return request<CloudConnectionResponse>({
    path: `/api/v1/cloud-connections/${cloudConnectionId}`,
    token,
  })
}

export function checkCloudConnectionHealth(
  token: string,
  cloudConnectionId: string,
) {
  return request<CloudConnectionHealthResponse>({
    path: `/api/v1/cloud-connections/${cloudConnectionId}/health`,
    token,
  })
}

export function deleteCloudConnection(
  token: string,
  cloudConnectionId: string,
) {
  return request<null>({
    path: `/api/v1/cloud-connections/${cloudConnectionId}`,
    method: 'DELETE',
    token,
  })
}
