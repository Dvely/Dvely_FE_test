import { request } from './http'
import type {
  BindDomainPayload,
  DomainResponse,
  DomainSearchResponse,
  VerificationGuideResponse,
} from '../types/domainbinding'

export function searchDomains(token: string, keyword: string) {
  return request<DomainSearchResponse>({
    path: `/api/v1/domain-search?keyword=${encodeURIComponent(keyword)}`,
    token,
  })
}

export function listProjectDomains(token: string, projectId: string) {
  return request<DomainResponse[]>({
    path: `/api/v1/projects/${projectId}/domains`,
    token,
  })
}

export function bindDomain(
  token: string,
  projectId: string,
  payload: BindDomainPayload,
) {
  return request<DomainResponse>({
    path: `/api/v1/projects/${projectId}/domains`,
    method: 'POST',
    token,
    body: payload,
  })
}

export function getDomain(token: string, domainId: string) {
  return request<DomainResponse>({
    path: `/api/v1/domains/${domainId}`,
    token,
  })
}

export function getVerificationGuide(token: string, domainId: string) {
  return request<VerificationGuideResponse>({
    path: `/api/v1/domains/${domainId}/verification-guide`,
    token,
  })
}

export function checkVerification(token: string, domainId: string) {
  return request<DomainResponse>({
    path: `/api/v1/domains/${domainId}/verification-checks`,
    method: 'POST',
    token,
  })
}

export function deleteDomain(token: string, domainId: string) {
  return request<null>({
    path: `/api/v1/domains/${domainId}`,
    method: 'DELETE',
    token,
  })
}
