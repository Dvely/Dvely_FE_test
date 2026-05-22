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
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getProjectOverview,
  getProjectActivityLogs,
  getProjectCommits,
  getRepositoryHealth,
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
  ProjectSummaryResponse,
} from './types/project'
import type { ConversationResponse } from './types/chat'
import type { DeployTargetType, VersionResponse } from './types/deployment'
import type {
  DomainResponse,
  DomainType,
  VerificationMethod,
} from './types/domainbinding'
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

  const [domainSearchKeyword, setDomainSearchKeyword] = useState('')
  const [domainId, setDomainId] = useState('')
  const [domainType, setDomainType] = useState<DomainType>('managed_subdomain')
  const [domainLabel, setDomainLabel] = useState('')
  const [customHostname, setCustomHostname] = useState('')
  const [verificationMethod, setVerificationMethod] =
    useState<VerificationMethod>('CNAME')
  const [domains, setDomains] = useState<DomainResponse[]>([])

  const [agentContent, setAgentContent] = useState('')
  const [agentProvider, setAgentProvider] = useState<AiProvider>('ANTHROPIC')
  const [agentTaskId, setAgentTaskId] = useState('')
  const [agentInputValue, setAgentInputValue] = useState('')

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
      ['Repository Visibility', repositoryVisibility],
    ]

    if (repositoryMode === 'create') {
      requiredFields.push(['Repository Name', projectRepositoryName])
    } else {
      requiredFields.push(['Repository Full Name', importRepositoryFullName])
    }

    if (!requireFields(key, requiredFields)) return

    const created = await runAuthed<ProjectCreateResponse>(key, (t) =>
      createProject(t, {
        name: projectName.trim(),
        repositoryMode,
        repositoryName:
          repositoryMode === 'create'
            ? projectRepositoryName.trim()
            : undefined,
        repositoryFullName:
          repositoryMode === 'existing'
            ? importRepositoryFullName.trim()
            : undefined,
        startMode,
        templateType: templateType.trim() || undefined,
        draftMode: draftMode.trim(),
        repositoryVisibility,
      }),
    )

    if (created?.projectId) {
      setProjectId(String(created.projectId))
    }
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
            프로젝트 가져오기에 사용
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
            <h2>2. 프로젝트 생성 또는 가져오기</h2>
            <p className="hint">새 레포 생성과 기존 레포 가져오기를 같은 위치에서 선택합니다.</p>
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
              기존 레포 가져오기
            </button>
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
            <h2>3. 프로젝트 확인과 변경</h2>
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
            <h2>4. 채팅</h2>
            <p className="hint">공통 Project ID와 Conversation ID를 이어서 사용합니다.</p>
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
              void runAuthed('chat.messages.send', (t) =>
                sendMessage(t, conversationId, {
                  content: messageContent,
                }),
              )
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
            <h2>5. 배포</h2>
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
            <h2>6. DomainBinding</h2>
            <p className="hint">공통 Project ID와 Domain ID로 도메인 검색, 연결, DNS 가이드, 검증을 테스트합니다.</p>
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
              placeholder="도메인 연결 후 자동 입력"
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
              if (result?.domainId) {
                setDomainId(String(result.domainId))
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
            onClick={() => {
              if (!requireFields('domain.delete', [['Domain ID', domainId]])) return
              void runAuthed('domain.delete', (t) => deleteDomain(t, domainId))
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
            <h2>7. Agent</h2>
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
    </div>
  )
}
