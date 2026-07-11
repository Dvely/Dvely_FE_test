export type CloudProvider = 'AWS' | 'GCP'

export type AwsCredentialType = 'ACCESS_KEY' | 'ROLE_ARN'

export type GcpCredentialType = 'SERVICE_ACCOUNT_KEY' | 'SERVICE_ACCOUNT_EMAIL'

export type CloudConnectionStatus =
  | 'CHECKING'
  | 'CONNECTED'
  | 'PERMISSION_MISSING'
  | 'BILLING_DISABLED'
  | 'REGION_UNSUPPORTED'
  | 'INVALID_CREDENTIAL'
  | 'UNKNOWN_ERROR'

export interface CreateCloudConnectionPayload {
  provider: CloudProvider
  displayName: string
  accountId?: string
  region: string
  roleArn?: string
  awsCredentialType?: AwsCredentialType
  accessKeyId?: string
  secretAccessKey?: string
  sessionToken?: string
  gcpCredentialType?: GcpCredentialType
  serviceAccountKeyJson?: string
  projectId?: string
  serviceAccountEmail?: string
}

export interface CreateCloudConnectionResponse {
  cloudConnectionId: number
  provider: CloudProvider
  status: CloudConnectionStatus
  jobId: string
}

export interface CloudConnectionResponse {
  cloudConnectionId: number
  provider: CloudProvider
  displayName: string
  accountId: string | null
  region: string
  roleArn: string | null
  awsCredentialType: AwsCredentialType | null
  accessKeyId: string | null
  secretAccessKeyConfigured: boolean
  sessionTokenConfigured: boolean
  gcpCredentialType: GcpCredentialType | null
  serviceAccountKeyConfigured: boolean
  projectId: string | null
  serviceAccountEmail: string | null
  status: CloudConnectionStatus
  lastCheckedAt: string | null
  createdAt: string | null
  updatedAt: string | null
}

export interface CloudConnectionHealthResponse {
  cloudConnectionId: number
  provider: CloudProvider
  status: CloudConnectionStatus
  message: string
  checkedAt: string
}

export interface CloudConnectionVerificationJobResponse {
  jobId: string
  cloudConnectionId: number
  status: string
  connectionStatus: CloudConnectionStatus
  message: string | null
  attempt: number
  createdAt: string
  startedAt: string | null
  completedAt: string | null
}
