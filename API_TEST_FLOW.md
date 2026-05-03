# API 테스트 흐름(프론트엔드 콘솔)

이 문서는 `Dvely_FE_test` UI로 인증, 프로젝트, GitHub 레포 선택, 채팅 API를 수동 테스트하는 흐름입니다.

## 전제 조건

1. 백엔드 서버를 시작합니다.
2. 프론트엔드를 시작합니다.
   - `cd Dvely_FE_test`
   - `pnpm install`
   - `pnpm dev`
3. 백엔드가 `http://localhost:8080`이 아니면 프론트 실행 전에 `VITE_API_BASE`를 설정합니다.

## 1. 인증

1. **GitHub 로그인**을 클릭합니다.
2. GitHub OAuth와 GitHub App 설치를 완료합니다.
3. 앱으로 돌아오면 **Access Token**이 자동 저장됩니다.
4. 필요하면 토큰을 직접 붙여넣고 **GET /users/me**로 확인합니다.
5. 새 레포 생성에서 GitHub user token 만료 메시지가 나오면 **GitHub App 권한 갱신**을 클릭해 GitHub App user 권한을 다시 승인합니다.

예상:
- 상태 메시지에 로그인 완료가 표시됩니다.
- `GET /users/me` 응답에 사용자 프로필 JSON이 표시됩니다.

## 2. 내 GitHub 레포 선택

1. **레포 목록 불러오기**를 클릭합니다.
2. 드롭다운에서 프로젝트로 가져올 레포를 선택합니다.
3. 선택한 레포를 프로젝트로 가져오려면 **프로젝트 가져오기에 사용**을 클릭합니다.

예상:
- 내 GitHub App이 설치되어 접근 가능한 레포 목록이 JSON으로 표시됩니다.
- 선택한 레포의 `fullName`, visibility, default branch가 요약 영역에 표시됩니다.

## 3. 프로젝트 생성 또는 가져오기

### 새 GitHub 레포를 만들면서 프로젝트 생성

1. **새 레포 생성** 모드를 선택합니다.
2. 값을 입력합니다.
   - Project Name
   - Repository Name
   - Start Mode: `blank` 또는 `template`
   - Template Type: 선택 사항
   - Draft Mode: 예: `draft`
   - Repository Visibility: `PRIVATE` 또는 `PUBLIC`
3. **프로젝트 생성**을 클릭합니다.

예상:
- 서버는 내 GitHub 레포 이름 중복을 확인합니다.
- 중복이 없으면 GitHub 레포를 생성하고 프로젝트의 source repository로 연결합니다.
- 생성 응답의 `projectId`가 공통 Project ID 입력에 자동 반영됩니다.

### 기존 GitHub 레포를 가져와 프로젝트 생성

1. **기존 레포 가져오기** 모드를 선택합니다.
2. 레포 목록에서 선택했거나 `owner/repo` 형식으로 Repository Full Name을 입력합니다.
3. Project Name과 나머지 프로젝트 필드를 입력합니다.
4. **프로젝트 생성**을 클릭합니다.

예상:
- 서버는 해당 GitHub 레포 접근 가능 여부를 확인합니다.
- 접근 가능하면 프로젝트를 만들고 기존 레포를 source repository로 연결합니다.
- 생성 응답의 `projectId`가 공통 Project ID 입력에 자동 반영됩니다.

## 4. 프로젝트 확인과 변경

1. 공통 **Project ID**를 확인합니다.
2. 필요한 API를 클릭합니다.
   - `GET Project`
   - `PATCH Name`
   - `DELETE Project`
   - `GET Overview`
   - `GET Activity`
   - `GET Commits`
   - `GET Health`

삭제 모드:
- `PROJECT_ONLY`: 프로젝트만 삭제하고 채팅은 30일 휴지통으로 이동합니다.
- `PROJECT_AND_REPOSITORY`: GitHub 레포까지 삭제하고 채팅은 즉시 삭제합니다.

## 5. 채팅

1. 공통 **Project ID**를 확인합니다.
2. **Create Conversation**을 클릭합니다.
3. 생성 응답의 `conversationId`가 공통 Conversation ID 입력에 자동 반영됩니다.
4. 메시지를 입력하고 **Send Message**를 클릭합니다.
5. 삭제, 휴지통 목록, 복원은 Conversation ID를 기준으로 테스트합니다.

## 참고

- 대부분의 엔드포인트에는 유효한 Access Token이 필요합니다.
- 브라우저에서 `PATCH` 요청이 실패한다면 백엔드 CORS 허용 메서드에 `PATCH`가 포함되어 있는지 확인합니다.
- 새로 생성한 빈 GitHub 레포는 preview 브랜치 준비를 위해 초기 커밋이 필요합니다. 백엔드는 새 레포 생성 시 초기화를 요청하고, 기존 빈 레포는 브랜치가 생길 때까지 preview 브랜치 생성을 건너뜁니다.
- 새 레포 생성은 GitHub App user token이 필요합니다. `bad_refresh_token` 또는 권한 만료 메시지가 나오면 **GitHub App 권한 갱신**을 클릭한 뒤 재시도합니다.
- 별도 배포용 GitHub 레포 바인딩은 사용하지 않습니다. GitHub Pages 배포는 public repository 조건을 따르고, private repository는 외부 클라우드 배포 경로에서 처리합니다.
