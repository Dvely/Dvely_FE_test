import { useEffect, useMemo, useState } from 'react'
import {
  getGithubLoginUrl,
  handleGithubCallback,
  getGithubAppInstallUrl,
  handleGithubAppCallback,
} from './api/auth'
import { API_BASE } from './api/http'
import { getMe } from './api/user'
import {
  listGithubRepositories,
  createProject,
  connectProjectRepository,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getProjectOverview,
  getProjectActivityLogs,
  getProjectCommits,
  getRepositoryHealth,
  getRepositorySettings,
  disconnectProjectRepository,
} from './api/project'
import {
  listConversations,
  createConversation,
  getConversation,
  deleteConversation,
  listTrashConversations,
  restoreConversation,
  listMessages,
  sendMessage,
} from './api/chat'
import {
  deploy,
  getVersions,
  getDeploymentCandidates,
  getVersionDetail,
  getDeploymentHistories,
  getDeploymentStatus,
  getDeploymentLogs,
} from './api/deployment'
import {
  searchDomains,
  listProjectDomains,
  bindDomain,
  getDomain,
  getVerificationGuide,
  checkVerification,
  deleteDomain,
} from './api/domainbinding'
import {
  listCloudConnections,
  createCloudConnection,
  getCloudConnection,
  checkCloudConnectionHealth,
  deleteCloudConnection,
} from './api/cloudconnection'
import {
  getEnvironmentVariables,
  createEnvironmentVariable,
  updateEnvironmentVariable,
  deleteEnvironmentVariable,
  getEnvironmentVariableHistory,
} from './api/environment'
import { getPreviewSessionStatus, getPreviewSessionLogs } from './api/preview'
import {
  submitDecision,
  getTaskStatus,
  submitTaskInput,
  closeAgentSession,
} from './api/agent'
import { tokenStorage } from './lib/token'
import type { AuthStep } from './types/auth'
import type {
  GithubRepositoryResponse,
  ProjectCreateResponse,
  ProjectRepositoryResponse,
  ProjectRepositorySettingsResponse,
  ProjectSummaryResponse,
} from './types/project'
import type { ConversationResponse } from './types/chat'
import type { DeployTargetType, VersionResponse } from './types/deployment'
import type {
  DomainResponse,
  DomainType,
  VerificationMethod,
} from './types/domainbinding'
import type {
  AwsCredentialType,
  CloudConnectionResponse,
  CloudProvider,
  GcpCredentialType,
} from './types/cloudconnection'
import type {
  EnvironmentScope,
  EnvironmentVariableResponse,
} from './types/environment'
import type { PreviewContainerStatusResponse } from './types/preview'
import type { AiProvider } from './types/agent'
import './App.css'

const AUTH_STEP_MESSAGES: Partial<Record<AuthStep, string>> = {
  loading: 'GitHub 로그인으로 이동합니다.',
  callback: 'GitHub 콜백을 처리하고 있습니다.',
  install: 'GitHub App 설치로 이동합니다.',
  done: '로그인이 완료되었습니다.',
}

function formatResponse(data: unknown): string {
  if (data === null || data === undefined || data === '') {
    return 'No content'
  }
  if (typeof data === 'string') {
    return data
  }
  return JSON.stringify(data, null, 2)
}

function formatDate(value: string | null): string {
  if (!value) return '-'
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function ResponseView({
  label,
  value,
}: {
  label: string
  value?: string
}) {
  if (!value) return null
  return (
    <div className="response-block">
      <div className="response-label">{label}</div>
      <pre className="response">{value}</pre>
    </div>
  )
}

export default function App() {
  const [authStep, setAuthStep] = useState<AuthStep>('idle')
  const [authError, setAuthError] = useState('')
  const [token, setToken] = useState(tokenStorage.get() ?? '')
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const [githubRepositories, setGithubRepositories] = useState<
    GithubRepositoryResponse[]
  >([])
  const [projects, setProjects] = useState<ProjectSummaryResponse[]>([])

  const [projectId, setProjectId] = useState('')
  const [projectName, setProjectName] = useState('')
  const [repositoryMode, setRepositoryMode] = useState<'create' | 'existing'>(
    'create',
  )
  const [projectRepositoryName, setProjectRepositoryName] = useState('')
  const [importRepositoryFullName, setImportRepositoryFullName] = useState('')
  const [startMode, setStartMode] = useState('blank')
  const [templateType, setTemplateType] = useState('')
  const [draftMode, setDraftMode] = useState('draft')
  const [repositoryVisibility, setRepositoryVisibility] = useState('PRIVATE')
  const [updateProjectName, setUpdateProjectName] = useState('')
  const [deleteMode, setDeleteMode] = useState('PROJECT_ONLY')

  const [conversationId, setConversationId] = useState('')
  const [messageContent, setMessageContent] = useState('')

  const [deployTargetType, setDeployTargetType] = useState<DeployTargetType>('LATEST')
  const [deployVersionName, setDeployVersionName] = useState('')
  const [versionId, setVersionId] = useState('')
  const [deploymentId, setDeploymentId] = useState('')
  const [versions, setVersions] = useState<VersionResponse[]>([])

  const [cloudConnectionId, setCloudConnectionId] = useState('')
  const [cloudProvider, setCloudProvider] = useState<CloudProvider>('AWS')
  const [awsCredentialType, setAwsCredentialType] =
    useState<AwsCredentialType>('ACCESS_KEY')
  const [gcpCredentialType, setGcpCredentialType] =
    useState<GcpCredentialType>('SERVICE_ACCOUNT_KEY')
  const [cloudDisplayName, setCloudDisplayName] = useState('AWS Seoul Account')
  const [cloudAccountId, setCloudAccountId] = useState('')
  const [cloudRegion, setCloudRegion] = useState('ap-northeast-2')
  const [cloudRoleArn, setCloudRoleArn] = useState('')
  const [awsAccessKeyId, setAwsAccessKeyId] = useState('')
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState('')
  const [awsSessionToken, setAwsSessionToken] = useState('')
  const [gcpProjectId, setGcpProjectId] = useState('')
  const [serviceAccountEmail, setServiceAccountEmail] = useState('')
  const [serviceAccountKeyJson, setServiceAccountKeyJson] = useState('')
  const [cloudConnections, setCloudConnections] = useState<
    CloudConnectionResponse[]
  >([])

  const [domainSearchKeyword, setDomainSearchKeyword] = useState('')
  const [domainId, setDomainId] = useState('')
  const [domainType, setDomainType] = useState<DomainType>('managed_subdomain')
  const [domainLabel, setDomainLabel] = useState('')
  const [customHostname, setCustomHostname] = useState('')
  const [verificationMethod, setVerificationMethod] =
    useState<VerificationMethod>('CNAME')
  const [domains, setDomains] = useState<DomainResponse[]>([])

  // `environmentScope` is shared by both the list filter (empty = all scopes) and the
  // create form (required there) — same reuse-one-field pattern as `domainType` above,
  // kept minimal rather than duplicating a near-identical select per action.
  const [environmentScope, setEnvironmentScope] = useState<EnvironmentScope | ''>('')
  const [environmentVariableId, setEnvironmentVariableId] = useState('')
  const [environmentKey, setEnvironmentKey] = useState('')
  const [environmentValue, setEnvironmentValue] = useState('')
  const [environmentSecret, setEnvironmentSecret] = useState(false)
  // Update-only fields: left blank/unchecked means "don't touch" for value (we omit
  // the field from the PATCH body), matching the backend's optional-field semantics.
  // `secret` has no such distinction here since it's one-way anyway (see hint text).
  const [environmentUpdateValue, setEnvironmentUpdateValue] = useState('')
  const [environmentUpdateSecret, setEnvironmentUpdateSecret] = useState(false)
  const [environmentHistoryLimit, setEnvironmentHistoryLimit] = useState('')
  const [environmentVariables, setEnvironmentVariables] = useState<
    EnvironmentVariableResponse[]
  >([])

  const [agentContent, setAgentContent] = useState('')
  const [agentProvider, setAgentProvider] = useState<AiProvider>('ANTHROPIC')
  const [agentTaskId, setAgentTaskId] = useState('')
  const [agentInputValue, setAgentInputValue] = useState('')

  const [repositorySettings, setRepositorySettings] =
    useState<ProjectRepositorySettingsResponse | null>(null)

  // No public "create session" endpoint exists — sessionId is obtained out-of-band
  // (e.g. from an Agent task's `previewUrl`/DB) and pasted in manually.
  const [previewSessionId, setPreviewSessionId] = useState('')
  const [previewTail, setPreviewTail] = useState('')
  const [previewSinceSeconds, setPreviewSinceSeconds] = useState('')
  // Kept separately from the raw `responses['preview.status']` JSON so we can render
  // a friendly "수집 실패" fallback for `resources: null` per the backend's documented
  // (expected, not an error) 3-second stats-collection timeout.
  const [previewStatus, setPreviewStatus] =
    useState<PreviewContainerStatusResponse | null>(null)

  const selectedImportRepository = useMemo(
    () =>
      githubRepositories.find(
        (repository) => repository.fullName === importRepositoryFullName,
      ),
    [githubRepositories, importRepositoryFullName],
  )

  useEffect(() => {
    const normalizedToken = token.trim()
    if (normalizedToken) {
      tokenStorage.set(normalizedToken)
    } else {
      tokenStorage.remove()
    }
  }, [token])

  useEffect(() => {
    if (window.location.pathname !== '/app/callback') return

    const params = new URLSearchParams(window.location.search)
    const installation_id = params.get('installation_id') ?? ''
    const setup_action = params.get('setup_action') ?? 'install'
    const state = params.get('state') ?? ''

    setAuthStep('callback')
    setAuthError('')

    handleGithubAppCallback({ installation_id, setup_action, state })
      .then(() => setAuthStep('done'))
      .catch((err: unknown) => {
        setAuthStep('error')
        setAuthError(
          err instanceof Error ? err.message : 'GitHub App callback failed.',
        )
      })
  }, [])

  useEffect(() => {
    if (window.location.pathname === '/app/callback') return

    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state') ?? ''
    if (!code) return

    window.history.replaceState({}, '', window.location.pathname)

    setAuthStep('callback')
    setAuthError('')

    handleGithubCallback({ code, state })
      .then(async ({ accessToken, githubAppInstalled }) => {
        setToken(accessToken)

        if (!githubAppInstalled) {
          setAuthStep('install')
          const { url } = await getGithubAppInstallUrl(accessToken)
          window.location.href = url
          return
        }

        setAuthStep('done')
      })
      .catch((err: unknown) => {
        setAuthStep('error')
        setAuthError(err instanceof Error ? err.message : 'Login failed.')
      })
  }, [])

  const authMessage = AUTH_STEP_MESSAGES[authStep]

  const setResponse = (key: string, value: string) => {
    setResponses((prev) => ({ ...prev, [key]: value }))
  }

  const setLoadingState = (key: string, value: boolean) => {
    setLoading((prev) => ({ ...prev, [key]: value }))
  }

  const run = async <T,>(
    key: string,
    action: () => Promise<T>,
  ): Promise<T | undefined> => {
    setLoadingState(key, true)
    try {
      const result = await action()
      setResponse(key, formatResponse(result))
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Request failed.'
      setResponse(key, `ERROR: ${message}`)
      return undefined
    } finally {
      setLoadingState(key, false)
    }
  }

  const runAuthed = async <T,>(
    key: string,
    action: (token: string) => Promise<T>,
  ): Promise<T | undefined> => {
    const accessToken = token.trim()
    if (!accessToken) {
      setResponse(key, 'ERROR: access token is required.')
      return undefined
    }
    return run(key, () => action(accessToken))
  }

  const requireFields = (key: string, fields: Array<[string, string]>) => {
    const missing = fields.find(([, value]) => !value.trim())
    if (!missing) return true

    setResponse(key, `ERROR: ${missing[0]} is required.`)
    return false
  }

  const handleLogin = async () => {
    setAuthStep('loading')
    setAuthError('')
    try {
      const { url } = await getGithubLoginUrl()
      window.location.href = url
    } catch (err) {
      setAuthStep('error')
      setAuthError(
        err instanceof Error
          ? err.message
          : 'Failed to get GitHub login URL.',
      )
    }
  }

  const handleRefreshGithubApp = async () => {
    const accessToken = token.trim()
    if (!accessToken) {
      setAuthStep('error')
      setAuthError('Access Token이 필요합니다.')
      return
    }

    setAuthStep('install')
    setAuthError('')
    try {
      const { url } = await getGithubAppInstallUrl(accessToken)
      window.location.href = url
    } catch (err) {
      setAuthStep('error')
      setAuthError(
        err instanceof Error
          ? err.message
          : 'GitHub App 권한 갱신 URL을 가져오지 못했습니다.',
      )
    }
  }

  const handleLoadGithubRepositories = async () => {
    const result = await runAuthed('github.repositories', (t) =>
      listGithubRepositories(t),
    )
    if (!result) return

    setGithubRepositories(result)
    if (!importRepositoryFullName && result[0]) {
      setImportRepositoryFullName(result[0].fullName)
      setRepositoryVisibility(result[0].visibility)
    }
  }

  const handleListProjects = async () => {
    const result = await runAuthed('project.list', (t) => getProjects(t))
    if (!result) return

    setProjects(result)
    if (!projectId && result[0]) {
      setProjectId(String(result[0].projectId))
    }
  }

  const handleApplyImportRepository = () => {
    if (!selectedImportRepository) {
      setResponse('github.repositories', 'ERROR: 가져올 저장소를 선택하세요.')
      return
    }
    setRepositoryMode('existing')
    setRepositoryVisibility(selectedImportRepository.visibility)
    setProjectName((current) => current || selectedImportRepository.name)
  }

  const handleCreateProject = async () => {
    const key = 'project.create'
    const requiredFields: Array<[string, string]> = [
      ['Project Name', projectName],
      ['Start Mode', startMode],
      ['Draft Mode', draftMode],
    ]

    if (!requireFields(key, requiredFields)) return

    const created = await runAuthed<ProjectCreateResponse>(key, (t) =>
      createProject(t, {
        name: projectName.trim(),
        startMode,
        templateType: templateType.trim() || undefined,
        draftMode: draftMode.trim(),
      }),
    )

    if (created?.projectId) {
      setProjectId(String(created.projectId))
    }
  }

  const handleConnectProjectRepository = async () => {
    const key = 'project.repository.connect'
    const requiredFields: Array<[string, string]> = [
      ['Project ID', projectId],
      ['Repository Visibility', repositoryVisibility],
    ]

    if (repositoryMode === 'create') {
      requiredFields.push(['Repository Name', projectRepositoryName])
    } else {
      requiredFields.push(['Repository Full Name', importRepositoryFullName])
    }

    if (!requireFields(key, requiredFields)) return

    await runAuthed<ProjectRepositoryResponse>(key, (t) =>
      connectProjectRepository(t, projectId, {
        repositoryMode,
        repositoryName:
          repositoryMode === 'create'
            ? projectRepositoryName.trim()
            : undefined,
        repositoryFullName:
          repositoryMode === 'existing'
            ? importRepositoryFullName.trim()
            : undefined,
        repositoryVisibility,
      }),
    )
  }

  const handleCreateConversation = async () => {
    const key = 'chat.conversations.create'
    if (!requireFields(key, [['Project ID', projectId]])) return

    const created = await runAuthed<ConversationResponse>(key, (t) =>
      createConversation(t, projectId),
    )
    if (created?.conversationId) {
      setConversationId(String(created.conversationId))
    }
  }

  const handleCreateCloudConnection = async () => {
    const key = 'cloud.create'
    const requiredFields: Array<[string, string]> = [
      ['Display Name', cloudDisplayName],
      ['Region', cloudRegion],
    ]

    if (cloudProvider === 'AWS') {
      if (awsCredentialType === 'ACCESS_KEY') {
        requiredFields.push(['AWS Access Key ID', awsAccessKeyId])
        requiredFields.push(['AWS Secret Access Key', awsSecretAccessKey])
      } else {
        requiredFields.push(['AWS Account ID', cloudAccountId])
        requiredFields.push(['AWS Role ARN', cloudRoleArn])
      }
    } else {
      if (gcpCredentialType === 'SERVICE_ACCOUNT_KEY') {
        requiredFields.push(['Service Account Key JSON', serviceAccountKeyJson])
      } else {
        requiredFields.push(['GCP Project ID', gcpProjectId])
        requiredFields.push(['Service Account Email', serviceAccountEmail])
      }
    }

    if (!requireFields(key, requiredFields)) return

    const result = await runAuthed(key, (t) =>
      createCloudConnection(t, {
        provider: cloudProvider,
        displayName: cloudDisplayName.trim(),
        accountId:
          cloudProvider === 'AWS' && cloudAccountId.trim()
            ? cloudAccountId.trim()
            : undefined,
        region: cloudRegion.trim(),
        roleArn:
          cloudProvider === 'AWS' && awsCredentialType === 'ROLE_ARN'
            ? cloudRoleArn.trim()
            : undefined,
        awsCredentialType:
          cloudProvider === 'AWS' ? awsCredentialType : undefined,
        accessKeyId:
          cloudProvider === 'AWS' && awsCredentialType === 'ACCESS_KEY'
            ? awsAccessKeyId.trim()
            : undefined,
        secretAccessKey:
          cloudProvider === 'AWS' && awsCredentialType === 'ACCESS_KEY'
            ? awsSecretAccessKey.trim()
            : undefined,
        sessionToken:
          cloudProvider === 'AWS' &&
          awsCredentialType === 'ACCESS_KEY' &&
          awsSessionToken.trim()
            ? awsSessionToken.trim()
            : undefined,
        gcpCredentialType:
          cloudProvider === 'GCP' ? gcpCredentialType : undefined,
        serviceAccountKeyJson:
          cloudProvider === 'GCP' &&
          gcpCredentialType === 'SERVICE_ACCOUNT_KEY'
            ? serviceAccountKeyJson.trim()
            : undefined,
        projectId:
          cloudProvider === 'GCP' && gcpProjectId.trim()
            ? gcpProjectId.trim()
            : undefined,
        serviceAccountEmail:
          cloudProvider === 'GCP' && serviceAccountEmail.trim()
            ? serviceAccountEmail.trim()
            : undefined,
      }),
    )

    if (result?.cloudConnectionId) {
      setCloudConnectionId(String(result.cloudConnectionId))
      setAwsSecretAccessKey('')
      setAwsSessionToken('')
      setServiceAccountKeyJson('')
    }
  }

  const loadingText = (key: string, text: string) =>
    loading[key] ? '요청 중...' : text

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <p className="eyebrow">Manual API Console</p>
          <h1>Dvely API 테스트</h1>
        </div>
        <div className="api-base">
          <span>API Base</span>
          <code>{API_BASE}</code>
        </div>
      </header>

      <section className="panel context-panel">
        <div className="panel-heading">
          <div>
            <h2>공통 컨텍스트</h2>
            <p className="hint">아래 값은 프로젝트와 채팅 요청에서 같이 사용됩니다.</p>
          </div>
          <div className="row">
            <button
              type="button"
              onClick={handleLogin}
              disabled={authStep === 'loading'}
            >
              GitHub 로그인
            </button>
            <button
              type="button"
              className="secondary"
              onClick={handleRefreshGithubApp}
              disabled={authStep === 'install'}
            >
              GitHub App 권한 갱신
            </button>
            <button type="button" className="secondary" onClick={() => setToken('')}>
              토큰 지우기
            </button>
          </div>
        </div>

        <div className="fields-grid context-grid">
          <label className="field span-2">
            <span>Access Token</span>
            <input
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="로그인 후 자동 입력되거나 직접 붙여넣기"
            />
          </label>
          <label className="field">
            <span>Project ID</span>
            <input
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
              placeholder="프로젝트 생성 후 자동 입력"
            />
          </label>
          <label className="field">
            <span>Conversation ID</span>
            <input
              value={conversationId}
              onChange={(event) => setConversationId(event.target.value)}
              placeholder="대화 생성 후 자동 입력"
            />
          </label>
        </div>

        <div className="row">
          <button
            type="button"
            className="secondary"
            onClick={() => runAuthed('user.me', (t) => getMe(t))}
            disabled={loading['user.me']}
          >
            {loadingText('user.me', 'GET /users/me')}
          </button>
          {authMessage && <p className="status">{authMessage}</p>}
          {authStep === 'error' && authError && (
            <p className="status error">{authError}</p>
          )}
        </div>
        <ResponseView label="User Response" value={responses['user.me']} />
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>1. GitHub 레포 선택</h2>
            <p className="hint">내 계정에서 접근 가능한 레포를 가져와 선택합니다.</p>
          </div>
          <button
            type="button"
            onClick={handleLoadGithubRepositories}
            disabled={loading['github.repositories']}
          >
            {loadingText('github.repositories', '레포 목록 불러오기')}
          </button>
        </div>

        <div className="fields-grid">
          <label className="field span-2">
            <span>선택한 GitHub 레포</span>
            <select
              value={importRepositoryFullName}
              onChange={(event) => {
                const value = event.target.value
                const repository = githubRepositories.find(
                  (item) => item.fullName === value,
                )
                setImportRepositoryFullName(value)
                if (repository) {
                  setRepositoryVisibility(repository.visibility)
                }
              }}
            >
              <option value="">레포를 선택하세요</option>
              {githubRepositories.map((repository) => (
                <option key={repository.fullName} value={repository.fullName}>
                  {repository.fullName}
                </option>
              ))}
            </select>
          </label>
          <div className="repo-summary">
            <strong>{selectedImportRepository?.fullName ?? '선택된 레포 없음'}</strong>
            <span>
              {selectedImportRepository
                ? `${selectedImportRepository.visibility} · ${selectedImportRepository.defaultBranch ?? 'no branch'} · ${formatDate(selectedImportRepository.updatedAt)}`
                : '목록을 불러온 뒤 선택하세요.'}
            </span>
          </div>
        </div>

        <div className="row">
          <button
            type="button"
            className="secondary"
            onClick={handleApplyImportRepository}
          >
            저장소 연결에 사용
          </button>
        </div>
        <ResponseView
          label="GitHub Repositories Response"
          value={responses['github.repositories']}
        />
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>2. 빈 프로젝트 생성</h2>
            <p className="hint">GitHub 저장소 없이 프로젝트 정보만 먼저 생성합니다.</p>
          </div>
        </div>

        <div className="fields-grid">
          <label className="field">
            <span>Project Name</span>
            <input
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="나의 프로젝트"
            />
          </label>

          <label className="field">
            <span>Start Mode</span>
            <select
              value={startMode}
              onChange={(event) => setStartMode(event.target.value)}
            >
              <option value="blank">blank</option>
              <option value="template">template</option>
            </select>
          </label>
          <label className="field">
            <span>Template Type</span>
            <input
              value={templateType}
              onChange={(event) => setTemplateType(event.target.value)}
              placeholder="선택 사항"
            />
          </label>
          <label className="field">
            <span>Draft Mode</span>
            <input
              value={draftMode}
              onChange={(event) => setDraftMode(event.target.value)}
              placeholder="draft"
            />
          </label>
        </div>

        <div className="row">
          <button
            type="button"
            onClick={handleCreateProject}
            disabled={loading['project.create']}
          >
            {loadingText('project.create', '프로젝트 생성')}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={handleListProjects}
            disabled={loading['project.list']}
          >
            {loadingText('project.list', '프로젝트 목록')}
          </button>
        </div>

        {projects.length > 0 && (
          <div className="project-list">
            {projects.map((project) => (
              <button
                type="button"
                className={
                  String(project.projectId) === projectId
                    ? 'project-item selected'
                    : 'project-item'
                }
                key={project.projectId}
                onClick={() => setProjectId(String(project.projectId))}
              >
                <strong>{project.name}</strong>
                <span>
                  #{project.projectId} · {project.deployStatus} ·{' '}
                  {project.updatedAtRelativeText}
                </span>
              </button>
            ))}
          </div>
        )}

        <ResponseView
          label="Create Project Response"
          value={responses['project.create']}
        />
        <ResponseView
          label="Project List Response"
          value={responses['project.list']}
        />
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>3. GitHub 저장소 연결</h2>
            <p className="hint">생성된 Project ID에 새 저장소를 만들거나 기존 저장소를 연결합니다.</p>
          </div>
          <div className="segmented" role="group" aria-label="Repository mode">
            <button
              type="button"
              className={repositoryMode === 'create' ? 'active' : ''}
              onClick={() => setRepositoryMode('create')}
            >
              새 레포 생성
            </button>
            <button
              type="button"
              className={repositoryMode === 'existing' ? 'active' : ''}
              onClick={() => setRepositoryMode('existing')}
            >
              기존 레포 연결
            </button>
          </div>
        </div>

        <div className="fields-grid">
          {repositoryMode === 'create' ? (
            <label className="field">
              <span>Repository Name</span>
              <input
                value={projectRepositoryName}
                onChange={(event) => setProjectRepositoryName(event.target.value)}
                placeholder="my-project-repo"
              />
            </label>
          ) : (
            <label className="field">
              <span>Repository Full Name</span>
              <input
                value={importRepositoryFullName}
                onChange={(event) => setImportRepositoryFullName(event.target.value)}
                placeholder="owner/repo"
              />
            </label>
          )}

          <label className="field">
            <span>Repository Visibility</span>
            <select
              value={repositoryVisibility}
              onChange={(event) => setRepositoryVisibility(event.target.value)}
            >
              <option value="PRIVATE">PRIVATE</option>
              <option value="PUBLIC">PUBLIC</option>
            </select>
          </label>
        </div>

        <div className="row">
          <button
            type="button"
            onClick={handleConnectProjectRepository}
            disabled={loading['project.repository.connect']}
          >
            {loadingText('project.repository.connect', '저장소 연결')}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              if (!requireFields('project.repository.health', [['Project ID', projectId]])) {
                return
              }
              void runAuthed('project.repository.health', (t) =>
                getRepositoryHealth(t, projectId),
              )
            }}
            disabled={loading['project.repository.health']}
          >
            {loadingText('project.repository.health', '저장소 상태 확인')}
          </button>
        </div>

        <ResponseView
          label="Connect Repository Response"
          value={responses['project.repository.connect']}
        />
        <ResponseView
          label="Repository Health Response"
          value={responses['project.repository.health']}
        />
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>4. 프로젝트 확인과 변경</h2>
            <p className="hint">공통 Project ID로 조회, 수정, 삭제, 개요 API를 호출합니다.</p>
          </div>
        </div>

        <div className="fields-grid">
          <label className="field">
            <span>Update Name</span>
            <input
              value={updateProjectName}
              onChange={(event) => setUpdateProjectName(event.target.value)}
              placeholder="새 프로젝트 이름"
            />
          </label>
          <label className="field">
            <span>Delete Mode</span>
            <select
              value={deleteMode}
              onChange={(event) => setDeleteMode(event.target.value)}
            >
              <option value="PROJECT_ONLY">PROJECT_ONLY</option>
              <option value="PROJECT_AND_REPOSITORY">
                PROJECT_AND_REPOSITORY
              </option>
            </select>
          </label>
        </div>

        <div className="button-grid">
          <button
            type="button"
            className="secondary"
            onClick={() => {
              if (!requireFields('project.detail', [['Project ID', projectId]])) {
                return
              }
              void runAuthed('project.detail', (t) => getProject(t, projectId))
            }}
            disabled={loading['project.detail']}
          >
            {loadingText('project.detail', 'GET Project')}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              if (
                !requireFields('project.update', [
                  ['Project ID', projectId],
                  ['Update Name', updateProjectName],
                ])
              ) {
                return
              }
              void runAuthed('project.update', (t) =>
                updateProject(t, projectId, { name: updateProjectName }),
              )
            }}
            disabled={loading['project.update']}
          >
            {loadingText('project.update', 'PATCH Name')}
          </button>
          <button
            type="button"
            className="danger"
            onClick={() => {
              if (!requireFields('project.delete', [['Project ID', projectId]])) {
                return
              }
              void runAuthed('project.delete', (t) =>
                deleteProject(t, projectId, deleteMode),
              )
            }}
            disabled={loading['project.delete']}
          >
            {loadingText('project.delete', 'DELETE Project')}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              if (!requireFields('project.overview', [['Project ID', projectId]])) {
                return
              }
              void runAuthed('project.overview', (t) =>
                getProjectOverview(t, projectId),
              )
            }}
            disabled={loading['project.overview']}
          >
            {loadingText('project.overview', 'GET Overview')}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              if (!requireFields('project.activity', [['Project ID', projectId]])) {
                return
              }
              void runAuthed('project.activity', (t) =>
                getProjectActivityLogs(t, projectId),
              )
            }}
            disabled={loading['project.activity']}
          >
            {loadingText('project.activity', 'GET Activity')}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              if (!requireFields('project.commits', [['Project ID', projectId]])) {
                return
              }
              void runAuthed('project.commits', (t) =>
                getProjectCommits(t, projectId),
              )
            }}
            disabled={loading['project.commits']}
          >
            {loadingText('project.commits', 'GET Commits')}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              if (!requireFields('project.health', [['Project ID', projectId]])) {
                return
              }
              void runAuthed('project.health', (t) =>
                getRepositoryHealth(t, projectId),
              )
            }}
            disabled={loading['project.health']}
          >
            {loadingText('project.health', 'GET Health')}
          </button>
        </div>

        <ResponseView label="Project Detail Response" value={responses['project.detail']} />
        <ResponseView label="Project Update Response" value={responses['project.update']} />
        <ResponseView label="Project Delete Response" value={responses['project.delete']} />
        <ResponseView label="Overview Response" value={responses['project.overview']} />
        <ResponseView label="Activity Response" value={responses['project.activity']} />
        <ResponseView label="Commits Response" value={responses['project.commits']} />
        <ResponseView label="Health Response" value={responses['project.health']} />
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>5. 채팅</h2>
            <p className="hint">
              공통 Project ID와 Conversation ID를 이어서 사용합니다. 메시지 전송이 Agent
              작업을 큐잉하면 응답의 taskId가 9번 Agent Task ID에 자동 반영됩니다.
            </p>
          </div>
        </div>

        <label className="field">
          <span>Message Content</span>
          <textarea
            rows={3}
            value={messageContent}
            onChange={(event) => setMessageContent(event.target.value)}
            placeholder="보낼 메시지"
          />
        </label>

        <div className="button-grid">
          <button
            type="button"
            className="secondary"
            onClick={() => {
              if (!requireFields('chat.conversations.list', [['Project ID', projectId]])) {
                return
              }
              void runAuthed('chat.conversations.list', (t) =>
                listConversations(t, projectId),
              )
            }}
            disabled={loading['chat.conversations.list']}
          >
            {loadingText('chat.conversations.list', 'List Conversations')}
          </button>
          <button
            type="button"
            onClick={handleCreateConversation}
            disabled={loading['chat.conversations.create']}
          >
            {loadingText('chat.conversations.create', 'Create Conversation')}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              if (
                !requireFields('chat.conversation.get', [
                  ['Conversation ID', conversationId],
                ])
              ) {
                return
              }
              void runAuthed('chat.conversation.get', (t) =>
                getConversation(t, conversationId),
              )
            }}
            disabled={loading['chat.conversation.get']}
          >
            {loadingText('chat.conversation.get', 'GET Conversation')}
          </button>
          <button
            type="button"
            className="danger"
            onClick={() => {
              if (
                !requireFields('chat.conversation.delete', [
                  ['Conversation ID', conversationId],
                ])
              ) {
                return
              }
              void runAuthed('chat.conversation.delete', (t) =>
                deleteConversation(t, conversationId),
              )
            }}
            disabled={loading['chat.conversation.delete']}
          >
            {loadingText('chat.conversation.delete', 'DELETE Conversation')}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => runAuthed('chat.trash.list', (t) => listTrashConversations(t))}
            disabled={loading['chat.trash.list']}
          >
            {loadingText('chat.trash.list', 'List Trash')}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              if (
                !requireFields('chat.trash.restore', [
                  ['Conversation ID', conversationId],
                ])
              ) {
                return
              }
              void runAuthed('chat.trash.restore', (t) =>
                restoreConversation(t, conversationId),
              )
            }}
            disabled={loading['chat.trash.restore']}
          >
            {loadingText('chat.trash.restore', 'Restore Conversation')}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              if (
                !requireFields('chat.messages.list', [
                  ['Conversation ID', conversationId],
                ])
              ) {
                return
              }
              void runAuthed('chat.messages.list', (t) =>
                listMessages(t, conversationId),
              )
            }}
            disabled={loading['chat.messages.list']}
          >
            {loadingText('chat.messages.list', 'List Messages')}
          </button>
          <button
            type="button"
            onClick={() => {
              if (
                !requireFields('chat.messages.send', [
                  ['Conversation ID', conversationId],
                  ['Message Content', messageContent],
                ])
              ) {
                return
              }
              void (async () => {
                const result = await runAuthed('chat.messages.send', (t) =>
                  sendMessage(t, conversationId, {
                    content: messageContent,
                  }),
                )
                // If the message queued an Agent task, hand its taskId to the shared
                // Agent Task ID field (section 9) so it can be polled immediately
                // without copy-pasting from the raw response JSON.
                if (result?.taskId) {
                  setAgentTaskId(result.taskId)
                }
              })()
            }}
            disabled={loading['chat.messages.send']}
          >
            {loadingText('chat.messages.send', 'Send Message')}
          </button>
        </div>

        <ResponseView
          label="Conversation List Response"
          value={responses['chat.conversations.list']}
        />
        <ResponseView
          label="Conversation Create Response"
          value={responses['chat.conversations.create']}
        />
        <ResponseView
          label="Conversation Get Response"
          value={responses['chat.conversation.get']}
        />
        <ResponseView
          label="Conversation Delete Response"
          value={responses['chat.conversation.delete']}
        />
        <ResponseView label="Trash List Response" value={responses['chat.trash.list']} />
        <ResponseView
          label="Trash Restore Response"
          value={responses['chat.trash.restore']}
        />
        <ResponseView
          label="Message List Response"
          value={responses['chat.messages.list']}
        />
        <ResponseView label="Send Message Response" value={responses['chat.messages.send']} />
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>6. 배포</h2>
            <p className="hint">공통 Project ID로 배포 요청, 버전 목록, 배포 후보, 버전 상세, 이력 및 로그를 조회합니다.</p>
          </div>
        </div>

        <div className="fields-grid">
          <label className="field">
            <span>Deploy Target Type</span>
            <select
              value={deployTargetType}
              onChange={(event) => setDeployTargetType(event.target.value as DeployTargetType)}
            >
              <option value="LATEST">LATEST</option>
              <option value="VERSION">VERSION</option>
            </select>
          </label>
          <label className="field">
            <span>Version Name (VERSION 타입일 때 필수)</span>
            <input
              value={deployVersionName}
              onChange={(event) => setDeployVersionName(event.target.value)}
              placeholder="v1.0.0"
              disabled={deployTargetType === 'LATEST'}
            />
          </label>
          <label className="field">
            <span>Version ID</span>
            <input
              value={versionId}
              onChange={(event) => setVersionId(event.target.value)}
              placeholder="버전 목록 조회 후 선택하거나 직접 입력"
            />
          </label>
          <label className="field">
            <span>Deployment ID</span>
            <input
              value={deploymentId}
              onChange={(event) => setDeploymentId(event.target.value)}
              placeholder="배포 요청 후 자동 입력"
            />
          </label>
        </div>

        <div className="button-grid">
          <button
            type="button"
            onClick={async () => {
              const key = 'deployment.deploy'
              if (!requireFields(key, [['Project ID', projectId]])) return
              if (
                deployTargetType === 'VERSION' &&
                !requireFields(key, [['Version Name', deployVersionName]])
              ) {
                return
              }
              const result = await runAuthed(key, (t) =>
                deploy(t, projectId, {
                  deployTargetType,
                  versionName: deployTargetType === 'VERSION' ? deployVersionName.trim() : undefined,
                }),
              )
              if (result?.deploymentId) {
                setDeploymentId(String(result.deploymentId))
              }
            }}
            disabled={loading['deployment.deploy']}
          >
            {loadingText('deployment.deploy', 'POST Deploy')}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={async () => {
              const key = 'deployment.versions'
              if (!requireFields(key, [['Project ID', projectId]])) return
              const result = await runAuthed(key, (t) => getVersions(t, projectId))
              if (!result) return
              setVersions(result)
              if (!versionId && result[0]) {
                setVersionId(String(result[0].versionId))
              }
            }}
            disabled={loading['deployment.versions']}
          >
            {loadingText('deployment.versions', 'GET Versions')}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              if (!requireFields('deployment.candidates', [['Project ID', projectId]])) return
              void runAuthed('deployment.candidates', (t) =>
                getDeploymentCandidates(t, projectId),
              )
            }}
            disabled={loading['deployment.candidates']}
          >
            {loadingText('deployment.candidates', 'GET Candidates')}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              if (!requireFields('deployment.version.detail', [['Version ID', versionId]])) return
              void runAuthed('deployment.version.detail', (t) =>
                getVersionDetail(t, versionId),
              )
            }}
            disabled={loading['deployment.version.detail']}
          >
            {loadingText('deployment.version.detail', 'GET Version Detail')}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              if (!requireFields('deployment.histories', [['Project ID', projectId]])) return
              void runAuthed('deployment.histories', (t) =>
                getDeploymentHistories(t, projectId),
              )
            }}
            disabled={loading['deployment.histories']}
          >
            {loadingText('deployment.histories', 'GET Histories')}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              if (!requireFields('deployment.status', [['Deployment ID', deploymentId]])) return
              void runAuthed('deployment.status', (t) =>
                getDeploymentStatus(t, deploymentId),
              )
            }}
            disabled={loading['deployment.status']}
          >
            {loadingText('deployment.status', 'GET Status')}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              if (!requireFields('deployment.logs', [['Deployment ID', deploymentId]])) return
              void runAuthed('deployment.logs', (t) =>
                getDeploymentLogs(t, deploymentId),
              )
            }}
            disabled={loading['deployment.logs']}
          >
            {loadingText('deployment.logs', 'GET Logs')}
          </button>
        </div>

        {versions.length > 0 && (
          <div className="project-list">
            {versions.map((version) => (
              <button
                type="button"
                className={
                  String(version.versionId) === versionId
                    ? 'project-item selected'
                    : 'project-item'
                }
                key={version.versionId}
                onClick={() => setVersionId(String(version.versionId))}
              >
                <strong>{version.versionName}</strong>
                <span>
                  #{version.versionId} · {version.deployStatus} ·{' '}
                  {version.title} · {formatDate(version.mergedAt)}
                </span>
              </button>
            ))}
          </div>
        )}

        <ResponseView label="Deploy Response" value={responses['deployment.deploy']} />
        <ResponseView label="Histories Response" value={responses['deployment.histories']} />
        <ResponseView label="Status Response" value={responses['deployment.status']} />
        <ResponseView label="Logs Response" value={responses['deployment.logs']} />
        <ResponseView label="Versions Response" value={responses['deployment.versions']} />
        <ResponseView label="Candidates Response" value={responses['deployment.candidates']} />
        <ResponseView label="Version Detail Response" value={responses['deployment.version.detail']} />
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>7. CloudConnection</h2>
            <p className="hint">AWS/GCP BYOC 연결을 등록하고 health 상태를 확인합니다.</p>
          </div>
        </div>

        <div className="fields-grid">
          <label className="field">
            <span>Cloud Connection ID</span>
            <input
              value={cloudConnectionId}
              onChange={(event) => setCloudConnectionId(event.target.value)}
              placeholder="등록 후 자동 입력"
            />
          </label>
          <label className="field">
            <span>Provider</span>
            <select
              value={cloudProvider}
              onChange={(event) => {
                const provider = event.target.value as CloudProvider
                setCloudProvider(provider)
                setAwsCredentialType('ACCESS_KEY')
                setGcpCredentialType('SERVICE_ACCOUNT_KEY')
                setCloudRegion(
                  provider === 'AWS' ? 'ap-northeast-2' : 'asia-northeast3',
                )
                setCloudDisplayName(
                  provider === 'AWS'
                    ? 'AWS Seoul Account'
                    : 'GCP Seoul Project',
                )
              }}
            >
              <option value="AWS">AWS</option>
              <option value="GCP">GCP</option>
            </select>
          </label>
          <label className="field">
            <span>AWS 인증 방식</span>
            <select
              value={awsCredentialType}
              onChange={(event) =>
                setAwsCredentialType(event.target.value as AwsCredentialType)
              }
              disabled={cloudProvider !== 'AWS'}
            >
              <option value="ACCESS_KEY">Access Key</option>
              <option value="ROLE_ARN">Role ARN</option>
            </select>
          </label>
          <label className="field">
            <span>GCP 인증 방식</span>
            <select
              value={gcpCredentialType}
              onChange={(event) =>
                setGcpCredentialType(event.target.value as GcpCredentialType)
              }
              disabled={cloudProvider !== 'GCP'}
            >
              <option value="SERVICE_ACCOUNT_KEY">Service Account Key JSON</option>
              <option value="SERVICE_ACCOUNT_EMAIL">Service Account Email</option>
            </select>
          </label>
          <label className="field">
            <span>Display Name</span>
            <input
              value={cloudDisplayName}
              onChange={(event) => setCloudDisplayName(event.target.value)}
              placeholder="AWS Seoul Account"
            />
          </label>
          <label className="field">
            <span>Region</span>
            <input
              value={cloudRegion}
              onChange={(event) => setCloudRegion(event.target.value)}
              placeholder={
                cloudProvider === 'AWS' ? 'ap-northeast-2' : 'asia-northeast3'
              }
            />
          </label>
          <label className="field">
            <span>AWS Account ID</span>
            <input
              value={cloudAccountId}
              onChange={(event) => setCloudAccountId(event.target.value)}
              placeholder={
                awsCredentialType === 'ACCESS_KEY'
                  ? '선택 사항'
                  : '123456789012'
              }
              disabled={cloudProvider !== 'AWS'}
            />
          </label>
          <label className="field span-2">
            <span>AWS Role ARN</span>
            <input
              value={cloudRoleArn}
              onChange={(event) => setCloudRoleArn(event.target.value)}
              placeholder="arn:aws:iam::123456789012:role/QeployDeployRole"
              disabled={cloudProvider !== 'AWS' || awsCredentialType !== 'ROLE_ARN'}
            />
          </label>
          <label className="field">
            <span>AWS Access Key ID</span>
            <input
              value={awsAccessKeyId}
              onChange={(event) => setAwsAccessKeyId(event.target.value)}
              placeholder="AKIA..."
              disabled={cloudProvider !== 'AWS' || awsCredentialType !== 'ACCESS_KEY'}
            />
          </label>
          <label className="field">
            <span>AWS Secret Access Key</span>
            <input
              type="password"
              value={awsSecretAccessKey}
              onChange={(event) => setAwsSecretAccessKey(event.target.value)}
              placeholder="Secret access key"
              disabled={cloudProvider !== 'AWS' || awsCredentialType !== 'ACCESS_KEY'}
            />
          </label>
          <label className="field span-2">
            <span>AWS Session Token</span>
            <input
              type="password"
              value={awsSessionToken}
              onChange={(event) => setAwsSessionToken(event.target.value)}
              placeholder="임시 키(ASIA...)를 쓸 때만 입력"
              disabled={cloudProvider !== 'AWS' || awsCredentialType !== 'ACCESS_KEY'}
            />
          </label>
          <label className="field">
            <span>GCP Project ID</span>
            <input
              value={gcpProjectId}
              onChange={(event) => setGcpProjectId(event.target.value)}
              placeholder={
                gcpCredentialType === 'SERVICE_ACCOUNT_KEY'
                  ? 'JSON에서 자동 추출, 선택 사항'
                  : 'qeploy-user-project'
              }
              disabled={cloudProvider !== 'GCP'}
            />
          </label>
          <label className="field span-2">
            <span>Service Account Email</span>
            <input
              value={serviceAccountEmail}
              onChange={(event) => setServiceAccountEmail(event.target.value)}
              placeholder={
                gcpCredentialType === 'SERVICE_ACCOUNT_KEY'
                  ? 'JSON에서 자동 추출, 선택 사항'
                  : 'qeploy-deploy@qeploy-user-project.iam.gserviceaccount.com'
              }
              disabled={cloudProvider !== 'GCP'}
            />
          </label>
          <label className="field span-2">
            <span>Service Account Key JSON</span>
            <textarea
              rows={6}
              value={serviceAccountKeyJson}
              onChange={(event) => setServiceAccountKeyJson(event.target.value)}
              placeholder='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
              disabled={
                cloudProvider !== 'GCP' ||
                gcpCredentialType !== 'SERVICE_ACCOUNT_KEY'
              }
            />
          </label>
        </div>

        <div className="button-grid">
          <button
            type="button"
            className="secondary"
            onClick={async () => {
              const result = await runAuthed('cloud.list', (t) =>
                listCloudConnections(t),
              )
              if (!result) return
              setCloudConnections(result)
              if (!cloudConnectionId && result[0]) {
                setCloudConnectionId(String(result[0].cloudConnectionId))
              }
            }}
            disabled={loading['cloud.list']}
          >
            {loadingText('cloud.list', 'GET Cloud Connections')}
          </button>
          <button
            type="button"
            onClick={handleCreateCloudConnection}
            disabled={loading['cloud.create']}
          >
            {loadingText('cloud.create', 'POST Cloud Connection')}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              if (
                !requireFields('cloud.detail', [
                  ['Cloud Connection ID', cloudConnectionId],
                ])
              ) {
                return
              }
              void runAuthed('cloud.detail', (t) =>
                getCloudConnection(t, cloudConnectionId),
              )
            }}
            disabled={loading['cloud.detail']}
          >
            {loadingText('cloud.detail', 'GET Cloud Connection')}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              if (
                !requireFields('cloud.health', [
                  ['Cloud Connection ID', cloudConnectionId],
                ])
              ) {
                return
              }
              void runAuthed('cloud.health', (t) =>
                checkCloudConnectionHealth(t, cloudConnectionId),
              )
            }}
            disabled={loading['cloud.health']}
          >
            {loadingText('cloud.health', 'GET Cloud Health')}
          </button>
          <button
            type="button"
            className="danger"
            onClick={() => {
              if (
                !requireFields('cloud.delete', [
                  ['Cloud Connection ID', cloudConnectionId],
                ])
              ) {
                return
              }
              void runAuthed('cloud.delete', (t) =>
                deleteCloudConnection(t, cloudConnectionId),
              )
            }}
            disabled={loading['cloud.delete']}
          >
            {loadingText('cloud.delete', 'DELETE Cloud Connection')}
          </button>
        </div>

        {cloudConnections.length > 0 && (
          <div className="project-list">
            {cloudConnections.map((connection) => (
              <button
                type="button"
                className={
                  String(connection.cloudConnectionId) === cloudConnectionId
                    ? 'project-item selected'
                    : 'project-item'
                }
                key={connection.cloudConnectionId}
                onClick={() =>
                  setCloudConnectionId(String(connection.cloudConnectionId))
                }
              >
                <strong>{connection.displayName}</strong>
                <span>
                  #{connection.cloudConnectionId} · {connection.provider} ·{' '}
                  {connection.region} · {connection.status}
                </span>
              </button>
            ))}
          </div>
        )}

        <ResponseView label="Cloud Connections Response" value={responses['cloud.list']} />
        <ResponseView label="Create Cloud Connection Response" value={responses['cloud.create']} />
        <ResponseView label="Cloud Connection Detail Response" value={responses['cloud.detail']} />
        <ResponseView label="Cloud Health Response" value={responses['cloud.health']} />
        <ResponseView label="Delete Cloud Connection Response" value={responses['cloud.delete']} />
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>8. DomainBinding</h2>
            <p className="hint">
              공통 Project ID와 Domain ID로 도메인 검색, 연결, DNS 가이드, 검증을 테스트합니다.
              연결/해제는 Agent task로 비동기 접수(202)되므로, taskId는 자동으로 9번 Agent
              Task ID에 채워집니다 — 완료 후 "GET Project Domains"를 다시 눌러 domainId를
              확인하세요.
            </p>
          </div>
        </div>

        <div className="fields-grid">
          <label className="field">
            <span>Search Keyword</span>
            <input
              value={domainSearchKeyword}
              onChange={(event) => setDomainSearchKeyword(event.target.value)}
              placeholder="myproject"
            />
          </label>
          <label className="field">
            <span>Domain ID</span>
            <input
              value={domainId}
              onChange={(event) => setDomainId(event.target.value)}
              placeholder="taskId 완료 후 GET Project Domains로 확인"
            />
          </label>
          <label className="field">
            <span>Domain Type</span>
            <select
              value={domainType}
              onChange={(event) => setDomainType(event.target.value as DomainType)}
            >
              <option value="managed_subdomain">managed_subdomain</option>
              <option value="custom_domain">custom_domain</option>
            </select>
          </label>
          <label className="field">
            <span>Verification Method</span>
            <select
              value={verificationMethod}
              onChange={(event) =>
                setVerificationMethod(event.target.value as VerificationMethod)
              }
              disabled={domainType === 'managed_subdomain'}
            >
              <option value="CNAME">CNAME</option>
              <option value="A">A</option>
            </select>
          </label>
          <label className="field">
            <span>Managed Label</span>
            <input
              value={domainLabel}
              onChange={(event) => setDomainLabel(event.target.value)}
              placeholder="myproject"
              disabled={domainType !== 'managed_subdomain'}
            />
          </label>
          <label className="field">
            <span>Custom Hostname</span>
            <input
              value={customHostname}
              onChange={(event) => setCustomHostname(event.target.value)}
              placeholder="www.example.com"
              disabled={domainType !== 'custom_domain'}
            />
          </label>
        </div>

        <div className="button-grid">
          <button
            type="button"
            className="secondary"
            onClick={async () => {
              const key = 'domain.search'
              if (!requireFields(key, [['Search Keyword', domainSearchKeyword]])) {
                return
              }
              const result = await runAuthed(key, (t) =>
                searchDomains(t, domainSearchKeyword),
              )
              if (!result) return
              setDomainLabel((current) => current || result.keyword)
            }}
            disabled={loading['domain.search']}
          >
            {loadingText('domain.search', 'GET Domain Search')}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={async () => {
              const key = 'domain.list'
              if (!requireFields(key, [['Project ID', projectId]])) return
              const result = await runAuthed(key, (t) =>
                listProjectDomains(t, projectId),
              )
              if (!result) return
              setDomains(result)
              if (!domainId && result[0]) {
                setDomainId(String(result[0].domainId))
              }
            }}
            disabled={loading['domain.list']}
          >
            {loadingText('domain.list', 'GET Project Domains')}
          </button>
          <button
            type="button"
            onClick={async () => {
              const key = 'domain.bind'
              if (!requireFields(key, [['Project ID', projectId]])) return
              if (
                domainType === 'managed_subdomain' &&
                !requireFields(key, [['Managed Label', domainLabel]])
              ) {
                return
              }
              if (
                domainType === 'custom_domain' &&
                !requireFields(key, [['Custom Hostname', customHostname]])
              ) {
                return
              }
              const result = await runAuthed(key, (t) =>
                bindDomain(t, projectId, {
                  type: domainType,
                  label:
                    domainType === 'managed_subdomain'
                      ? domainLabel.trim()
                      : undefined,
                  hostname:
                    domainType === 'custom_domain'
                      ? customHostname.trim()
                      : undefined,
                  verificationMethod:
                    domainType === 'custom_domain'
                      ? verificationMethod
                      : undefined,
                }),
              )
              // NOTE: this is an async submission (HTTP 202) — the response carries a
              // `taskId`, not a `domainId`. The domain record only exists once the
              // Agent task finishes, so we hand the taskId to the shared Agent Task ID
              // field (section 9) for polling, then the operator re-runs
              // "GET Project Domains" below to pick up the resulting domainId.
              if (result?.taskId) {
                setAgentTaskId(result.taskId)
              }
            }}
            disabled={loading['domain.bind']}
          >
            {loadingText('domain.bind', 'POST Bind Domain')}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              if (!requireFields('domain.detail', [['Domain ID', domainId]])) return
              void runAuthed('domain.detail', (t) => getDomain(t, domainId))
            }}
            disabled={loading['domain.detail']}
          >
            {loadingText('domain.detail', 'GET Domain')}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              if (!requireFields('domain.guide', [['Domain ID', domainId]])) return
              void runAuthed('domain.guide', (t) =>
                getVerificationGuide(t, domainId),
              )
            }}
            disabled={loading['domain.guide']}
          >
            {loadingText('domain.guide', 'GET Verification Guide')}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              if (!requireFields('domain.check', [['Domain ID', domainId]])) return
              void runAuthed('domain.check', (t) =>
                checkVerification(t, domainId),
              )
            }}
            disabled={loading['domain.check']}
          >
            {loadingText('domain.check', 'POST Verification Check')}
          </button>
          <button
            type="button"
            className="danger"
            onClick={async () => {
              if (!requireFields('domain.delete', [['Domain ID', domainId]])) return
              // Also async (HTTP 202 + taskId) — same tracking approach as bindDomain.
              const result = await runAuthed('domain.delete', (t) =>
                deleteDomain(t, domainId),
              )
              if (result?.taskId) {
                setAgentTaskId(result.taskId)
              }
            }}
            disabled={loading['domain.delete']}
          >
            {loadingText('domain.delete', 'DELETE Domain')}
          </button>
        </div>

        {domains.length > 0 && (
          <div className="project-list">
            {domains.map((domain) => (
              <button
                type="button"
                className={
                  String(domain.domainId) === domainId
                    ? 'project-item selected'
                    : 'project-item'
                }
                key={domain.domainId}
                onClick={() => setDomainId(String(domain.domainId))}
              >
                <strong>{domain.hostname}</strong>
                <span>
                  #{domain.domainId} · {domain.type} · {domain.status}
                </span>
              </button>
            ))}
          </div>
        )}

        <ResponseView label="Domain Search Response" value={responses['domain.search']} />
        <ResponseView label="Project Domains Response" value={responses['domain.list']} />
        <ResponseView label="Bind Domain Response" value={responses['domain.bind']} />
        <ResponseView label="Domain Detail Response" value={responses['domain.detail']} />
        <ResponseView label="Verification Guide Response" value={responses['domain.guide']} />
        <ResponseView label="Verification Check Response" value={responses['domain.check']} />
        <ResponseView label="Delete Domain Response" value={responses['domain.delete']} />
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>9. Environment</h2>
            <p className="hint">
              공통 Project ID로 프로젝트 환경변수/Secrets를 관리합니다. secret=true로 만든
              변수는 어떤 응답에서도 평문이 노출되지 않으며(항상 value: null), 목록에서
              "설정됨(숨김)"으로 표시됩니다. secret은 false→true로만 바꿀 수 있고
              true→false로 되돌리면 400이 반환됩니다.
            </p>
          </div>
        </div>

        <div className="fields-grid">
          <label className="field">
            <span>Environment Variable ID</span>
            <input
              value={environmentVariableId}
              onChange={(event) => setEnvironmentVariableId(event.target.value)}
              placeholder="생성/목록에서 자동 입력"
            />
          </label>
          <label className="field">
            <span>Scope</span>
            <select
              value={environmentScope}
              onChange={(event) =>
                setEnvironmentScope(event.target.value as EnvironmentScope | '')
              }
            >
              <option value="">(전체 — 목록 조회 전용)</option>
              <option value="PREVIEW">PREVIEW</option>
              <option value="PRODUCTION">PRODUCTION</option>
            </select>
          </label>
          <label className="field">
            <span>Key</span>
            <input
              value={environmentKey}
              onChange={(event) => setEnvironmentKey(event.target.value)}
              placeholder="API_BASE_URL"
            />
          </label>
          <label className="field">
            <span>Value</span>
            <input
              value={environmentValue}
              onChange={(event) => setEnvironmentValue(event.target.value)}
              placeholder="https://api.example.com"
            />
          </label>
          <label className="field">
            <span>Secret</span>
            <input
              type="checkbox"
              checked={environmentSecret}
              onChange={(event) => setEnvironmentSecret(event.target.checked)}
            />
          </label>
          <label className="field">
            <span>Update Value (비우면 값 유지)</span>
            <input
              value={environmentUpdateValue}
              onChange={(event) => setEnvironmentUpdateValue(event.target.value)}
              placeholder="비우면 PATCH body에서 생략"
            />
          </label>
          <label className="field">
            <span>Update Secret (체크 시 true로 전송)</span>
            <input
              type="checkbox"
              checked={environmentUpdateSecret}
              onChange={(event) => setEnvironmentUpdateSecret(event.target.checked)}
            />
          </label>
          <label className="field">
            <span>History Limit</span>
            <input
              value={environmentHistoryLimit}
              onChange={(event) => setEnvironmentHistoryLimit(event.target.value)}
              placeholder="기본 50, 최대 200"
            />
          </label>
        </div>

        <div className="button-grid">
          <button
            type="button"
            className="secondary"
            onClick={async () => {
              const key = 'env.list'
              if (!requireFields(key, [['Project ID', projectId]])) return
              const result = await runAuthed(key, (t) =>
                getEnvironmentVariables(t, projectId, environmentScope),
              )
              if (!result) return
              setEnvironmentVariables(result)
              if (!environmentVariableId && result[0]) {
                setEnvironmentVariableId(String(result[0].environmentVariableId))
              }
            }}
            disabled={loading['env.list']}
          >
            {loadingText('env.list', 'GET Variables')}
          </button>
          <button
            type="button"
            onClick={async () => {
              const key = 'env.create'
              if (
                !requireFields(key, [
                  ['Project ID', projectId],
                  ['Key', environmentKey],
                  ['Scope', environmentScope],
                ])
              ) {
                return
              }
              const result = await runAuthed(key, (t) =>
                createEnvironmentVariable(t, projectId, {
                  key: environmentKey.trim(),
                  value: environmentValue,
                  // `environmentScope` is validated non-blank by requireFields above,
                  // so this cast is safe (the empty-string option is filter-only).
                  scope: environmentScope as EnvironmentScope,
                  secret: environmentSecret,
                }),
              )
              if (result?.environmentVariableId) {
                setEnvironmentVariableId(String(result.environmentVariableId))
              }
            }}
            disabled={loading['env.create']}
          >
            {loadingText('env.create', 'POST Create Variable')}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              const key = 'env.update'
              if (
                !requireFields(key, [
                  ['Project ID', projectId],
                  ['Environment Variable ID', environmentVariableId],
                ])
              ) {
                return
              }
              void runAuthed(key, (t) =>
                updateEnvironmentVariable(t, projectId, environmentVariableId, {
                  // Omit `value` entirely when the field is blank, so an untouched
                  // input means "keep current value" rather than "set it to ''".
                  ...(environmentUpdateValue
                    ? { value: environmentUpdateValue }
                    : {}),
                  secret: environmentUpdateSecret,
                }),
              )
            }}
            disabled={loading['env.update']}
          >
            {loadingText('env.update', 'PATCH Update Variable')}
          </button>
          <button
            type="button"
            className="danger"
            onClick={() => {
              const key = 'env.delete'
              if (
                !requireFields(key, [
                  ['Project ID', projectId],
                  ['Environment Variable ID', environmentVariableId],
                ])
              ) {
                return
              }
              void runAuthed(key, (t) =>
                deleteEnvironmentVariable(t, projectId, environmentVariableId),
              )
            }}
            disabled={loading['env.delete']}
          >
            {loadingText('env.delete', 'DELETE Variable')}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              const key = 'env.history'
              if (!requireFields(key, [['Project ID', projectId]])) return
              void runAuthed(key, (t) =>
                getEnvironmentVariableHistory(t, projectId, environmentHistoryLimit),
              )
            }}
            disabled={loading['env.history']}
          >
            {loadingText('env.history', 'GET Variable History')}
          </button>
        </div>

        {environmentVariables.length > 0 && (
          <div className="project-list">
            {environmentVariables.map((variable) => (
              <button
                type="button"
                className={
                  String(variable.environmentVariableId) === environmentVariableId
                    ? 'project-item selected'
                    : 'project-item'
                }
                key={variable.environmentVariableId}
                onClick={() =>
                  setEnvironmentVariableId(String(variable.environmentVariableId))
                }
              >
                <strong>
                  {variable.scope} · {variable.key}
                </strong>
                <span>
                  #{variable.environmentVariableId} ·{' '}
                  {variable.secret ? '설정됨(숨김)' : variable.value}
                </span>
              </button>
            ))}
          </div>
        )}

        <ResponseView label="Variables Response" value={responses['env.list']} />
        <ResponseView label="Create Variable Response" value={responses['env.create']} />
        <ResponseView label="Update Variable Response" value={responses['env.update']} />
        <ResponseView label="Delete Variable Response" value={responses['env.delete']} />
        <ResponseView label="Variable History Response" value={responses['env.history']} />
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>10. Agent</h2>
            <p className="hint">자연어 요청을 제출하면 taskId를 받아 폴링으로 상태를 확인합니다. WAITING_INPUT이면 질문에 응답하세요.</p>
          </div>
        </div>

        <div className="fields-grid">
          <label className="field span-2">
            <span>요청 내용 (content)</span>
            <textarea
              rows={3}
              value={agentContent}
              onChange={(event) => setAgentContent(event.target.value)}
              placeholder="React로 투두 앱을 만들고 GitHub Pages에 배포해줘"
            />
          </label>
          <label className="field">
            <span>AI Provider</span>
            <select
              value={agentProvider}
              onChange={(event) => setAgentProvider(event.target.value as AiProvider)}
            >
              <option value="ANTHROPIC">ANTHROPIC (Claude)</option>
              <option value="OPENAI">OPENAI (GPT)</option>
            </select>
          </label>
          <label className="field">
            <span>Task ID</span>
            <input
              value={agentTaskId}
              onChange={(event) => setAgentTaskId(event.target.value)}
              placeholder="요청 제출 후 자동 입력"
            />
          </label>
          <label className="field span-2">
            <span>사용자 입력값 (WAITING_INPUT 상태일 때)</span>
            <input
              value={agentInputValue}
              onChange={(event) => setAgentInputValue(event.target.value)}
              placeholder="에이전트 질문에 대한 응답. 예: my-react-app"
            />
          </label>
        </div>

        <div className="button-grid">
          <button
            type="button"
            onClick={async () => {
              const key = 'agent.decision'
              if (!requireFields(key, [['요청 내용', agentContent]])) return
              const result = await runAuthed(key, (t) =>
                submitDecision(t, {
                  content: agentContent.trim(),
                  aiProvider: agentProvider,
                  projectId: projectId ? Number(projectId) : null,
                }),
              )
              if (result?.taskId) {
                setAgentTaskId(result.taskId)
              }
            }}
            disabled={loading['agent.decision']}
          >
            {loadingText('agent.decision', 'POST Decision')}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              if (!requireFields('agent.status', [['Task ID', agentTaskId]])) return
              void runAuthed('agent.status', (t) => getTaskStatus(t, agentTaskId))
            }}
            disabled={loading['agent.status']}
          >
            {loadingText('agent.status', 'GET Task Status')}
          </button>
          <button
            type="button"
            onClick={() => {
              const key = 'agent.input'
              if (
                !requireFields(key, [
                  ['Task ID', agentTaskId],
                  ['입력값', agentInputValue],
                ])
              ) {
                return
              }
              void runAuthed(key, (t) =>
                submitTaskInput(t, agentTaskId, { value: agentInputValue.trim() }),
              )
            }}
            disabled={loading['agent.input']}
          >
            {loadingText('agent.input', 'POST Task Input')}
          </button>
          <button
            type="button"
            className="danger"
            onClick={() => void runAuthed('agent.session.close', (t) => closeAgentSession(t))}
            disabled={loading['agent.session.close']}
          >
            {loadingText('agent.session.close', 'DELETE Session')}
          </button>
        </div>

        <ResponseView label="Decision Response" value={responses['agent.decision']} />
        <ResponseView label="Task Status Response" value={responses['agent.status']} />
        <ResponseView label="Task Input Response" value={responses['agent.input']} />
        <ResponseView label="Close Session Response" value={responses['agent.session.close']} />
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>11. Repository Settings</h2>
            <p className="hint">
              공통 Project ID로 저장소 연결 설정을 조회/해제합니다. 저장소가 연결되지
              않은 프로젝트도 200으로 응답하며 connected: false로 표시됩니다. DELETE는
              연결 정보만 제거하며 GitHub 저장소·워크플로·Pages는 삭제되지 않습니다.
            </p>
          </div>
        </div>

        <div className="button-grid">
          <button
            type="button"
            className="secondary"
            onClick={async () => {
              const key = 'repo.settings'
              if (!requireFields(key, [['Project ID', projectId]])) return
              const result = await runAuthed(key, (t) =>
                getRepositorySettings(t, projectId),
              )
              setRepositorySettings(result ?? null)
            }}
            disabled={loading['repo.settings']}
          >
            {loadingText('repo.settings', 'GET Repository Settings')}
          </button>
          <button
            type="button"
            className="danger"
            onClick={() => {
              const key = 'repo.disconnect'
              if (!requireFields(key, [['Project ID', projectId]])) return
              void runAuthed(key, (t) =>
                disconnectProjectRepository(t, projectId),
              )
            }}
            disabled={loading['repo.disconnect']}
          >
            {loadingText('repo.disconnect', 'DELETE Repository (연결 해제)')}
          </button>
        </div>

        {repositorySettings && !repositorySettings.connected && (
          <p className="hint">
            이 프로젝트는 연결된 GitHub 저장소가 없습니다. 3번 섹션에서 저장소를
            연결해 보세요.
          </p>
        )}

        <ResponseView
          label="Repository Settings Response"
          value={responses['repo.settings']}
        />
        <ResponseView
          label="Disconnect Repository Response"
          value={responses['repo.disconnect']}
        />
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>12. Preview 운영</h2>
            <p className="hint">
              Preview 세션은 별도 생성 API가 없습니다 — Agent CODE 스텝이 내부적으로
              만든 세션 ID를 taskId/DB에서 확인해 아래에 붙여넣으세요. status 조회는
              Docker stats 샘플링 때문에 p95 약 1.5초가 걸리므로 5초 이상 주기로
              폴링하는 것을 권장합니다.
            </p>
          </div>
        </div>

        <div className="fields-grid">
          <label className="field span-2">
            <span>Preview Session ID</span>
            <input
              value={previewSessionId}
              onChange={(event) => setPreviewSessionId(event.target.value)}
              placeholder="Agent task의 previewUrl / DB에서 확인"
            />
          </label>
          <label className="field">
            <span>Log Tail</span>
            <input
              value={previewTail}
              onChange={(event) => setPreviewTail(event.target.value)}
              placeholder="기본 200, [1, 2000]로 clamp"
            />
          </label>
          <label className="field">
            <span>Log Since Seconds</span>
            <input
              value={previewSinceSeconds}
              onChange={(event) => setPreviewSinceSeconds(event.target.value)}
              placeholder="최근 N초. 예: 300"
            />
          </label>
        </div>

        <div className="button-grid">
          <button
            type="button"
            className="secondary"
            onClick={async () => {
              const key = 'preview.status'
              if (!requireFields(key, [['Preview Session ID', previewSessionId]])) {
                return
              }
              const result = await runAuthed(key, (t) =>
                getPreviewSessionStatus(t, previewSessionId),
              )
              setPreviewStatus(result ?? null)
            }}
            disabled={loading['preview.status']}
          >
            {loadingText('preview.status', 'GET Container Status')}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              const key = 'preview.logs'
              if (!requireFields(key, [['Preview Session ID', previewSessionId]])) {
                return
              }
              void runAuthed(key, (t) =>
                getPreviewSessionLogs(
                  t,
                  previewSessionId,
                  previewTail,
                  previewSinceSeconds,
                ),
              )
            }}
            disabled={loading['preview.logs']}
          >
            {loadingText('preview.logs', 'GET Container Logs')}
          </button>
        </div>

        {previewStatus && (
          <p className="hint">
            리소스 사용량:{' '}
            {previewStatus.resources
              ? `메모리 ${previewStatus.resources.memoryUsagePercent}% · CPU ${previewStatus.resources.cpuPercent}%`
              : '수집 실패 (컨테이너 미실행이거나 stats 조회가 3초를 초과함 — 정상적으로 발생할 수 있는 상태입니다)'}
          </p>
        )}

        <ResponseView
          label="Container Status Response"
          value={responses['preview.status']}
        />
        <ResponseView label="Container Logs Response" value={responses['preview.logs']} />
      </section>
    </div>
  )
}
