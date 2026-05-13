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
  hostname: string
  status: DomainStatus
  verificationMethod: VerificationMethod | null
  dnsTarget: string | null
  lastCheckedAt: string | null
  createdAt: string | null
  updatedAt: string | null
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
