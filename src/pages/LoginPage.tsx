import type { AuthStep } from '../types/auth'
import styles from './LoginPage.module.css'

interface Props {
  step: AuthStep
  errorMessage: string
  onLogin: () => void
}

const STEP_MESSAGES: Partial<Record<AuthStep, string>> = {
  loading: 'GitHub 로그인 페이지로 이동 중...',
  callback: 'GitHub 인증 처리 중...',
  install: 'GitHub App 설치 페이지로 이동 중...',
}

export default function LoginPage({ step, errorMessage, onLogin }: Props) {
  const isProcessing = step === 'loading' || step === 'callback' || step === 'install'
  const processingMessage = STEP_MESSAGES[step]

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Dvely</h1>
        <p className={styles.subtitle}>GitHub으로 시작하세요</p>

        {isProcessing ? (
          <div className={styles.processing}>
            <span className={styles.spinner} aria-hidden="true" />
            <p className={styles.processingText}>{processingMessage}</p>
          </div>
        ) : (
          <button
            type="button"
            className={styles.githubButton}
            onClick={onLogin}
            disabled={isProcessing}
          >
            <GithubIcon />
            GitHub으로 로그인
          </button>
        )}

        {step === 'error' && (
          <p className={styles.errorMessage} role="alert">{errorMessage}</p>
        )}
      </div>
    </div>
  )
}

function GithubIcon() {
  return (
    <svg
      className={styles.githubIcon}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
    </svg>
  )
}
