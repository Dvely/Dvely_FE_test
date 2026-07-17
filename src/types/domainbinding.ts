export type DomainType =
  | 'managed_subdomain'
  | 'purchasable_domain'
  | 'custom_domain'

export type DomainStatus =
  | 'REQUESTED'
  | 'PROVISIONING'
  | 'VERIFYING'
  | 'CONNECTED'
  | 'FAILED'

export type VerificationMethod = 'CNAME' | 'A'

// Backend `DomainHostingTarget` enum (domainbinding/domain/value). Determines
// which adapter (GitHub Pages / AWS / GCP) actually provisions the domain.
export type HostingTarget = 'GITHUB_PAGES' | 'AWS' | 'GCP'

// Backend `CertificateStatus` enum. TLS certificate lifecycle for the domain.
export type CertificateStatus = 'PENDING' | 'PROVISIONING' | 'ACTIVE' | 'FAILED'

export interface DomainSearchCandidateResponse {
  type: DomainType
  hostname: string
  available: boolean
  price: number | null
  currency: string
}

export interface DomainSearchResponse {
  keyword: string
  results: DomainSearchCandidateResponse[]
}

export interface BindDomainPayload {
  type: DomainType
  label?: string
  hostname?: string
  verificationMethod?: VerificationMethod
}

export interface DomainResponse {
  domainId: number
  projectId: number
  type: DomainType
  // Which infra actually serves this domain (backend `DomainResponse.hostingTarget`).
  hostingTarget: HostingTarget
  hostname: string
  status: DomainStatus
  verificationMethod: VerificationMethod | null
  dnsTarget: string | null
  // Whether HTTPS is enforced for this domain (always true for GitHub Pages today,
  // kept explicit because AWS/GCP hosting targets may not enforce it yet).
  httpsEnforced: boolean
  certificateStatus: CertificateStatus
  certificateExpiresAt: string | null
  lastCheckedAt: string | null
  createdAt: string | null
  updatedAt: string | null
}

// `POST/DELETE /projects/{projectId}/domains` and `DELETE /domains/{domainId}` do NOT
// return a `DomainResponse` — domain binding/unbinding is submitted as an async Agent
// task (HTTP 202), and the actual domain record only exists once that task completes.
// Poll `GET /agent/tasks/{taskId}` with `taskId`, then re-fetch
// `GET /projects/{projectId}/domains` to obtain the real `domainId`.
export interface DomainBindingSubmissionResponse {
  taskId: string
  status: string
  approvalIds: number[]
}

export interface VerificationRecordResponse {
  type: VerificationMethod
  host: string
  value: string
}

export interface VerificationGuideResponse {
  hostname: string
  verificationMethod: VerificationMethod
  records: VerificationRecordResponse[]
}
