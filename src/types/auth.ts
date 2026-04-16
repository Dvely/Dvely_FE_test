export type AuthStep =
  | 'idle'           // 초기 상태
  | 'loading'        // 처리 중
  | 'callback'       // ?code= 처리 중
  | 'install'        // GitHub App 설치 필요 → 리다이렉트 중
  | 'done'           // 완료
  | 'error'          // 에러
