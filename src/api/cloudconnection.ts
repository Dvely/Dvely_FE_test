import { request } from './http'
import type {
  CloudConnectionHealthResponse,
  CloudConnectionResponse,
  CreateCloudConnectionPayload,
  CreateCloudConnectionResponse,
} from '../types/cloudconnection'

export function listCloudConnections(token: string) {
  return request<CloudConnectionResponse[]>({
    path: '/api/v1/cloud-connections',
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
