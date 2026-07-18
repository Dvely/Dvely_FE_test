# API 테스트 흐름(프론트엔드 콘솔)

이 문서는 `Dvely_FE_test` UI로 인증, 프로젝트, GitHub 레포 선택, 채팅(CloudOps 포함), 배포, CloudConnection, DomainBinding, Environment, Repository Settings, Preview 운영, 배포 실패 복구, 인프라 설정, Cost & Budget API를 수동 테스트하는 흐름입니다.

## 전제 조건

1. 백엔드 서버를 시작합니다.
2. 프론트엔드를 시작합니다.
   - `cd Dvely_FE_test`
   - `pnpm install`
   - `pnpm dev`
3. 백엔드가 `http://localhost:8080`이 아니면 프론트 실행 전에 `VITE_API_BASE`를 설정합니다.
4. DomainBinding의 관리형 서브도메인을 테스트하려면 백엔드 `application-local.yml`에 Cloudflare 값을 설정합니다.
   - `cloudflare.api-token`
   - `cloudflare.zone-id`
   - `cloudflare.managed-domain: qeploy.com`

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
- `PROJECT_ONLY`: 프로젝트만 삭제하고 채팅은 7일 휴지통으로 이동합니다.
- `PROJECT_AND_REPOSITORY`: GitHub 레포까지 삭제하고 채팅은 즉시 삭제합니다.

## 5. 채팅

1. 공통 **Project ID**를 확인합니다.
2. **Create Conversation**을 클릭합니다.
3. 생성 응답의 `conversationId`가 공통 Conversation ID 입력에 자동 반영됩니다.
4. 메시지를 입력하고 **Send Message**를 클릭합니다.
5. 삭제, 휴지통 목록, 복원은 Conversation ID를 기준으로 테스트합니다.

### CloudOps(인프라 운영) 자연어 예시

CloudOps는 별도 HTTP 엔드포인트가 없습니다 — 채팅 메시지가 Agent의 `INFRA_OPERATE` 스텝으로 라우팅되어 처리됩니다. **Message Content**에 아래와 같은 자연어를 입력하고 평소처럼 **Send Message**를 클릭해 테스트합니다.

- "서버 상태 보여줘" — 현재 인프라 상태 조회
- "로그 보여줘" — 서버/컨테이너 로그 조회
- "재시작해줘" — 인프라 재시작 조작

응답의 `taskId`가 10번 Agent Task ID에 자동 반영되므로, **GET Task Status**로 진행 상황을 확인합니다. 인프라 조작성 요청은 프로젝트 Chat 설정의 승인 정책에 따라 실행 전 승인이 필요할 수 있습니다(이 콘솔에는 Approval 처리 화면이 없으므로 필요 시 `POST /approvals/{approvalId}/approve`를 직접 호출합니다).

## 6. 배포

1. 공통 **Project ID**를 확인합니다.
2. GitHub Pages 배포를 테스트하려면 프로젝트 저장소가 public이고 GitHub App 권한이 유효해야 합니다.
3. `LATEST` 배포를 테스트할 때는 **Deploy Target Type**을 `LATEST`로 둡니다.
4. 특정 태그 기준 배포를 테스트할 때는 **Deploy Target Type**을 `VERSION`으로 바꾸고 **Version Name**에 태그명을 입력합니다.
5. **POST Deploy**를 클릭합니다.
6. 응답의 `deploymentId`가 공통 Deployment ID 입력에 자동 반영됩니다.
7. 배포 상태 확인은 아래 순서로 진행합니다.
   - `GET Histories`
   - `GET Status`
   - `GET Logs`
8. 버전 관련 화면은 아래 버튼으로 확인합니다.
   - `GET Versions`: merge/tag 기반 버전 목록 조회
   - `GET Candidates`: 재배포/롤백 가능한 배포 후보 조회
   - `GET Version Detail`: Version ID 기준 상세 조회

예상:
- `POST Deploy` 응답은 `IN_PROGRESS` 상태와 `pagesUrl`을 반환합니다.
- GitHub Actions 실행이 완료되면 `GET Status`의 `status`가 `LIVE` 또는 `FAILED`로 바뀝니다.
- `LIVE`가 되면 Project의 `currentUrl`과 배포 이력의 `deployedUrl`이 DomainBinding DNS target 계산에 사용됩니다.

주의:
- `GET Logs`는 `workflowRunId`가 기록된 뒤 정상 로그를 가져올 수 있습니다.
- GitHub Pages 배포는 현재 GitHub Pages 정책상 public repository 조건을 따릅니다.
- `VERSION` 배포는 입력한 태그가 GitHub 저장소에 존재해야 합니다.

## 7. CloudConnection

CloudConnection은 사용자의 AWS/GCP 계정을 Qeploy에 연결하는 BYOC 테스트입니다.

### AWS Access Key 연결 테스트

1. **Provider**를 `AWS`로 둡니다.
2. **AWS 인증 방식**을 `Access Key`로 둡니다.
3. 값을 입력합니다.
   - Display Name: 예: `AWS Seoul Account`
   - Region: 예: `ap-northeast-2`
   - AWS Access Key ID
   - AWS Secret Access Key
   - AWS Session Token: 임시 키(`ASIA...`)를 사용할 때만 입력
   - AWS Account ID: 선택 사항
4. **POST Cloud Connection**을 클릭합니다.
5. 응답의 `cloudConnectionId`가 공통 Cloud Connection ID 입력에 자동 반영됩니다.
6. **GET Cloud Health**를 클릭해 상태를 확인합니다.
7. 필요하면 **GET Cloud Connections**, **GET Cloud Connection**, **DELETE Cloud Connection**으로 목록/상세/해제를 테스트합니다.

예상:
- 등록 직후 응답은 `VALIDATED` 상태(형식 검증 통과)와 `jobId`를 반환합니다(`CHECKING`이 아님 — 실측 확인).
- Secret Access Key와 Session Token은 응답에 노출되지 않고 저장 시 AES로 암호화됩니다.
- 현재 백엔드는 외부 AWS SDK 호출 없이 입력값과 region/key 형식만 검증합니다.
- health 확인 시 형식이 유효하면 `CONNECTED`, 잘못된 region이면 `REGION_UNSUPPORTED`, 누락/오류 credential이면 `INVALID_CREDENTIAL`이 반환됩니다.

주의:
- root 계정 Access Key는 사용하지 않습니다.
- 테스트용 IAM User를 따로 만들고 필요한 권한만 부여한 뒤 사용합니다.
- 장기 Access Key는 테스트가 끝나면 비활성화하거나 삭제합니다.
- `AKIA...`로 시작하는 장기 키는 AWS Session Token을 비워둡니다. `ASIA...`로 시작하는 임시 키만 Session Token이 필요합니다.
- CloudConnection DB 컬럼 변경 후에는 백엔드 서버를 재시작해 Flyway 마이그레이션을 적용합니다.

### AWS Role ARN 연결 테스트

1. **Provider**를 `AWS`로 둡니다.
2. **AWS 인증 방식**을 `Role ARN`으로 바꿉니다.
3. 값을 입력합니다.
   - Display Name: 예: `AWS Seoul Account`
   - Region: 예: `ap-northeast-2`
   - AWS Account ID: 12자리 계정 ID
   - AWS Role ARN: 예: `arn:aws:iam::123456789012:role/QeployDeployRole`
4. **POST Cloud Connection**을 클릭합니다.
5. **GET Cloud Health**로 상태를 확인합니다.

### GCP Service Account Key JSON 연결 테스트

1. **Provider**를 `GCP`로 변경합니다.
2. **GCP 인증 방식**을 `Service Account Key JSON`으로 둡니다.
3. 로컬에서 `gcloud` CLI로 서비스 계정과 key JSON을 준비합니다.

   ```bash
   gcloud auth login
   gcloud config set project qeploy-user-project
   gcloud iam service-accounts create qeploy-deploy \
     --display-name="Qeploy Deploy"
   gcloud projects add-iam-policy-binding qeploy-user-project \
     --member="serviceAccount:qeploy-deploy@qeploy-user-project.iam.gserviceaccount.com" \
     --role="roles/editor"
   gcloud iam service-accounts keys create ./qeploy-service-account.json \
     --iam-account="qeploy-deploy@qeploy-user-project.iam.gserviceaccount.com"
   ```

4. `qeploy-service-account.json` 파일 내용을 복사해 **Service Account Key JSON**에 붙여넣습니다.
5. 값을 입력합니다.
   - Display Name: 예: `GCP Seoul Project`
   - Region: 예: `asia-northeast3`
   - GCP Project ID: JSON의 `project_id`에서 자동 추출되므로 선택 사항
   - Service Account Email: JSON의 `client_email`에서 자동 추출되므로 선택 사항
6. **POST Cloud Connection**을 클릭합니다.
7. **GET Cloud Health**로 상태를 확인합니다.

예상:
- Service Account Key JSON의 `project_id`, `client_email`, `private_key` 형식을 검증합니다.
- Service Account Key JSON은 응답에 노출되지 않고 저장 시 AES로 암호화됩니다.
- 현재 백엔드는 외부 GCP SDK 호출 없이 입력값과 region/key JSON 형식만 검증합니다.

### GCP Service Account Email 연결 테스트

1. **Provider**를 `GCP`로 변경합니다.
2. **GCP 인증 방식**을 `Service Account Email`로 바꿉니다.
3. 값을 입력합니다.
   - Display Name: 예: `GCP Seoul Project`
   - Region: 예: `asia-northeast3`
   - GCP Project ID: 예: `qeploy-user-project`
   - Service Account Email: 예: `qeploy-deploy@qeploy-user-project.iam.gserviceaccount.com`
4. **POST Cloud Connection**을 클릭합니다.
5. **GET Cloud Health**로 상태를 확인합니다.

주의:
- `roles/editor`는 테스트 편의용 예시입니다. 실제 운영에서는 배포에 필요한 최소 권한만 부여해야 합니다.
- 테스트가 끝나면 생성한 service account key를 삭제하거나 비활성화합니다.
- `projectId`와 service account email의 프로젝트 ID는 일치해야 합니다.
- 이 API는 Qeploy와 클라우드 계정 간 연결 정보만 삭제하며, 실제 클라우드 리소스를 삭제하지 않습니다.
- 실제 AWS AssumeRole, GCP IAM/Billing 확인은 외부 연동 단계에서 확장할 예정입니다.

## 8. DomainBinding

DomainBinding은 도메인 검색, 프로젝트 도메인 목록, 도메인 연결, DNS 가이드, DNS 검증, 연결 해제를 테스트합니다.

### managed_subdomain 테스트

1. 먼저 배포 섹션에서 프로젝트를 배포하고 `LIVE` 상태가 되었는지 확인합니다.
2. **Search Keyword**에 사용할 라벨을 입력합니다.
   - 예: `myproject`
3. **GET Domain Search**를 클릭합니다.
4. 응답에서 `myproject.qeploy.com` 후보가 `available: true`인지 확인합니다.
5. **Domain Type**을 `managed_subdomain`으로 둡니다.
6. **Managed Label**에 동일한 라벨을 입력합니다.
7. **POST Bind Domain**을 클릭합니다. 도메인 연결은 Agent task로 비동기 제출되므로 응답은
   `domainId`가 아니라 `taskId`/`status`/`approvalIds`를 담은 202입니다(`taskId`는 공통
   Agent Task ID 입력에 자동 반영됩니다).
8. **GET Task Status**로 task가 `DONE`이 될 때까지 폴링합니다(승인 정책이 켜져 있으면
   `WAITING_APPROVAL` 상태에서 먼저 승인 절차가 필요합니다).
9. task가 `DONE`이 되면 **GET Project Domains**를 다시 클릭해 실제 `domainId`를 확인하고
   공통 Domain ID 입력에 반영합니다.
10. **POST Verification Check**를 클릭한 뒤 **GET Domain**으로 상태를 확인합니다.
11. 테스트가 끝나면 **DELETE Domain**으로 Cloudflare DNS 레코드와 연결 정보를 제거합니다
    (마찬가지로 202 + `taskId` 비동기 응답이며, 실제 삭제는 task 완료 후 반영됩니다).

예상:
- 연결 성공 시 Cloudflare에 `label.qeploy.com` CNAME 레코드가 생성되고, GitHub Pages custom domain에도 같은 hostname이 등록됩니다.
- Agent task 완료 후 생성된 도메인의 최초 상태는 보통 `VERIFYING`입니다.
- Cloudflare 레코드 조회와 GitHub Pages custom domain 확인이 모두 성공하면 verification check 후 `CONNECTED`가 됩니다.

### custom_domain 테스트

1. 먼저 배포 섹션에서 프로젝트를 배포하고 `LIVE` 상태가 되었는지 확인합니다.
2. **Domain Type**을 `custom_domain`으로 바꿉니다.
3. **Custom Hostname**에 사용자가 보유한 도메인을 입력합니다.
   - 예: `www.example.com`
4. **Verification Method**를 선택합니다.
   - 일반적으로 `CNAME`
5. **POST Bind Domain**을 클릭합니다. managed_subdomain과 동일하게 202 + `taskId` 응답이므로,
   **GET Task Status**로 `DONE`이 될 때까지 폴링한 뒤 **GET Project Domains**로 실제
   `domainId`를 확인해 공통 Domain ID 입력에 반영합니다.
6. **GET Verification Guide**를 클릭해 DNS에 등록할 레코드를 확인합니다.
7. 외부 DNS provider에서 안내된 CNAME/A 레코드를 등록합니다.
8. DNS 전파 후 **POST Verification Check**를 클릭합니다.
9. **GET Domain**으로 `CONNECTED` 여부를 확인합니다.

예상:
- custom domain은 Cloudflare DNS를 직접 수정하지 않습니다.
- 서버는 GitHub Pages custom domain에 hostname을 등록하고, 사용자가 DNS에 설정해야 할 `dnsTarget`을 안내합니다.
- verification check는 실제 DNS 값과 GitHub Pages custom domain 설정을 함께 확인합니다.

주의:
- Domain Search도 현재 테스트 콘솔에서는 Access Token을 붙여 호출합니다.
- managed_subdomain은 백엔드 `application-local.yml`의 `cloudflare.api-token`, `cloudflare.zone-id`, `cloudflare.managed-domain`이 필요합니다.
- 현재 Cloudflare Zone ID는 `qeploy.com` 기준이어야 합니다.
- 도메인 연결은 같은 hostname 중복 등록을 허용하지 않습니다.
- purchasable_domain은 검색 후보만 표시하며 실제 구매/등록은 아직 지원하지 않습니다.

## 9. Environment

Environment는 프로젝트별 환경변수/Secrets 생성·조회·수정·삭제와 변경 이력 조회를 테스트합니다.

1. 공통 **Project ID**를 확인합니다.
2. **Scope**를 `PREVIEW` 또는 `PRODUCTION`으로 선택합니다(생성 시 필수. `(전체)` 옵션은 목록 조회 전용이며 생성에는 사용할 수 없습니다).
3. **Key**/**Value**를 입력하고, 민감 정보라면 **Secret** 체크박스를 켭니다.
4. **POST Create Variable**을 클릭합니다.
5. 응답의 `environmentVariableId`가 공통 Environment Variable ID 입력에 자동 반영됩니다.
6. **GET Variables**를 클릭해 목록을 조회합니다.
   - `secret: true`인 항목은 응답의 `value`가 항상 `null`이며, 콘솔 목록에는 "설정됨(숨김)"으로 표시됩니다. 평문이 어디에도 노출되지 않는지 이 단계에서 확인합니다.
7. **Update Value**에 새 값을 입력하고(비워두면 값은 유지됩니다) **PATCH Update Variable**을 클릭해 값을 수정합니다.
8. **GET Variable History**로 방금 수행한 CREATED/UPDATED 이력이 최신순으로 조회되는지 확인합니다.
9. 테스트가 끝나면 **DELETE Variable**로 정리합니다.

예상:
- Secret로 생성한 변수는 목록/생성/수정 응답 어디에서도 평문 `value`가 오지 않습니다(`value: null`).
- 이력 응답도 값 자체는 포함하지 않고, `valueChanged`(값이 실제로 바뀌었는지)만 알려줍니다.
- 동일 (프로젝트, scope, key) 조합으로 다시 생성하면 409가 반환됩니다.

주의:
- **secret은 한 방향으로만 바뀝니다**: `false → true`는 가능하지만, 이미 `secret: true`인 변수를 **Update Secret** 체크 해제 상태로 PATCH하면(=`secret: false` 전송) 백엔드가 400을 반환합니다. 이는 버그가 아니라 의도된 안전장치입니다.
- `key`/`scope`는 생성 후 변경할 수 없습니다. 이름을 바꾸려면 삭제 후 재생성합니다.
- History Limit을 비우면 50, 200을 넘겨도 200으로 보정되어 조회됩니다.

## 10. Repository Settings

Repository Settings는 프로젝트의 저장소 연결 설정 조회와 연결 해제를 테스트합니다.

1. 공통 **Project ID**를 확인합니다.
2. **GET Repository Settings**를 클릭합니다.
   - 저장소가 연결된 프로젝트라면 `connected: true`와 함께 `repositoryFullName`/`repositoryUrl`/`defaultBranch`/`repositoryVisibility`/`bindingStatus`/`repositoryHealth`/`connectedAt`/`lastSyncedAt`이 채워집니다.
   - 저장소가 연결되지 않은 프로젝트로 호출하면 404가 아니라 200과 `connected: false`가 반환되고, 나머지 저장소 전용 필드는 `null`입니다(콘솔에 안내 문구가 표시됩니다).
3. 연결 해제를 테스트하려면 **DELETE Repository (연결 해제)**를 클릭합니다.
4. 다시 **GET Repository Settings**를 눌러 `connected: false`로 바뀌었는지 확인합니다.

예상:
- `defaultBranch`는 매 요청마다 GitHub에서 실시간 조회되므로 약 500ms 추가 지연이 있으며, 조회 실패 시 `null`로 degrade됩니다(요청 자체는 실패하지 않습니다).
- **DELETE Repository**는 프로젝트의 저장소 연결 정보만 제거합니다. 실제 GitHub 저장소·워크플로·GitHub Pages 설정은 삭제되지 않으며, 배포 이력/도메인 연결 등 다른 도메인의 상태도 자동으로 정리되지 않습니다(자연 단절). 이후 3번 섹션에서 동일하거나 다른 저장소를 다시 연결할 수 있습니다.

주의:
- 이 DELETE는 6번 배포 섹션과 8번 DomainBinding 섹션에서 사용 중인 저장소를 끊을 수 있으므로, 다른 섹션 테스트 도중에는 실행하지 않는 것을 권장합니다.

## 11. Preview 운영

Preview 운영은 Agent CODE 스텝이 내부적으로 띄운 Docker 프리뷰 컨테이너의 상태·로그를 읽기 전용으로 조회하는 흐름입니다. 이 콘솔에는 프리뷰 세션을 새로 만드는 API가 없으므로, 실행 중인 Agent task(또는 DB)에서 `sessionId`를 확인해 아래 입력에 붙여넣어야 합니다.

1. 10번 Agent 섹션에서 CODE 스텝을 포함한 요청을 실행하고, 완료 후 `previewUrl`이 채워진 taskId를 확인합니다(또는 DB의 `preview_sessions` 테이블에서 `sessionId`를 직접 확인합니다).
2. **Preview Session ID**에 확인한 값을 입력합니다.
3. **GET Container Status**를 클릭합니다.
4. **GET Container Logs**를 클릭합니다. 필요하면 **Log Tail**(기본 200, [1, 2000]로 clamp)과 **Log Since Seconds**(최근 N초, 음수는 0으로 처리)를 입력합니다.

예상:
- `resources`는 컨테이너가 실행 중이 아니거나, stats 수집이 3초를 넘기면 `null`입니다 — 콘솔은 이 경우를 에러가 아니라 "수집 실패"로 표시합니다. status 조회 자체의 p95 지연이 약 1.5초이므로 폴링 주기는 5초 이상을 권장합니다.
- 컨테이너가 이미 제거된 세션도 404가 아니라 `containerRunning: false`(status), `containerRunning: false`+`logText: ""`(logs) 200으로 응답합니다.
- `logText`는 각 줄이 Docker 타임스탬프로 시작하는 단일 문자열입니다. 로그 수집 자체가 타임아웃되면 문자열 끝에 `[TRUNCATED] ...` 마커가 그대로 포함되므로, 응답을 가공하지 말고 그대로 확인합니다.
- 로그는 영속화되지 않으며 컨테이너가 제거되면 함께 사라집니다(다운로드/스트리밍 미지원).

## 12. 배포 실패 복구

배포 실패 복구는 6번 배포 섹션에서 만든 실패(FAILED) 배포를 재시도하거나, 실패 원인을 분석하는 흐름입니다. 이 섹션은 6번 섹션의 공통 **Deployment ID**를 그대로 사용합니다.

1. 6번 배포 섹션에서 실패하는 배포를 하나 만듭니다(예: 존재하지 않는 태그로 `VERSION` 배포, 또는 GitHub Actions가 실패하도록 코드를 구성).
2. **GET Status**로 대상 배포가 `FAILED` 상태인지 확인합니다.
3. **POST Analyze Failure**를 클릭합니다. 신규 분석은 GitHub Actions 로그 수집과 LLM 호출 때문에 **약 15~30초**가 걸릴 수 있습니다 — 버튼이 "요청 중..."으로 바뀐 채 오래 유지되는 것이 정상이며, 새로고침하거나 중복 클릭하지 않습니다.
4. 같은 배포로 **GET Failure Analysis**를 클릭해 저장된 분석이 그대로 재조회되는지 확인합니다(LLM 재호출 없이 즉시 응답).
5. 아직 한 번도 분석하지 않은 배포로 **GET Failure Analysis**를 먼저 호출하면 404가 반환됩니다 — 이 경우 3번의 POST를 먼저 실행해야 합니다.
6. 복구를 시도하려면 **POST Retry Deployment**를 클릭합니다. 응답의 새 `deploymentId`가 공통 Deployment ID에 자동 반영되므로, 이어서 **GET Status**로 새 배포의 진행 상황을 확인합니다.

예상:
- `POST Analyze Failure`는 멱등입니다 — 이미 저장된 분석이 있으면 LLM을 다시 호출하지 않고 그대로 반환합니다.
- `analysisSource`가 `RULE_BASED`로 나온다면 LLM 호출 자체가 실패해 규칙 기반 분석으로 자동 대체된 것입니다(결함이 아닙니다).
- `POST Retry Deployment`는 실패한 이력을 덮어쓰지 않고 **새 이력**으로 재큐잉합니다. 기존 실패 기록은 감사 목적으로 그대로 남습니다.
- 대상 배포가 `FAILED`가 아닌 상태(예: `LIVE`, `IN_PROGRESS`)에서 재시도/분석을 시도하면 409가 반환됩니다.

## 13. 인프라 설정

인프라 설정은 프로젝트의 배포 아키텍처/컴퓨팅 티어/스토리지/네트워크 4개 값을 저장·조회하고 변경 이력을 확인하는 흐름입니다.

1. 공통 **Project ID**를 확인합니다.
2. **GET Configuration**을 클릭합니다.
   - 7번 CloudConnection에서 CONNECTED 연결을 아직 선택하지 않은 프로젝트라면 `configurable: false`가 반환됩니다(404가 아닙니다). 이 경우 콘솔에 안내 문구가 표시되며, 저장 전에 먼저 클라우드 연결을 등록/검증하고 (이 콘솔에는 없는) `PUT /projects/{id}/settings/infrastructure`로 `cloudConnectionId`를 선택해야 합니다.
3. 4개 select에서 원하는 값을 고르고 **PUT Save Configuration**을 클릭합니다.
4. 응답에 `pendingChange`가 있으면 콘솔에 "승인 대기 중" 안내가 표시됩니다 — 프로젝트의 Chat 설정 중 `infraApprovalRequired`가 true(기본값)이면 즉시 적용되지 않고 INFRA_OPERATION 승인이 필요하기 때문입니다. 이 콘솔에는 Approval 처리 화면이 없으므로, 승인/거부는 `POST /approvals/{approvalId}/approve` 또는 `/reject`를 Swagger 등으로 직접 호출해야 합니다.
5. **GET Configuration History**로 방금 만든 CREATED/UPDATED 이력이 `PENDING_APPROVAL` 또는 `APPLIED` 상태로 조회되는지 확인합니다.

예상:
- 현재 적용값과 완전히 동일한 값으로 다시 PUT하면 이력·승인 생성 없이 현재 상태 그대로 반환됩니다(no-op).
- 승인 대기 중인 변경이 이미 있는 상태에서 다시 PUT하면 409가 반환됩니다(먼저 기존 건을 승인/거부해야 합니다).
- History Limit을 비우면 50, 200을 넘겨도 200으로 보정되어 조회됩니다. `PENDING_APPROVAL`/`REJECTED`를 포함한 모든 상태가 감사 목적으로 조회됩니다.

주의:
- 이 화면은 새로 추가된 `.../settings/infrastructure/configuration` 계약만 다룹니다. 클라우드 연결(cloudConnectionId) 자체를 선택/해제하는 기존 `.../settings/infrastructure` API는 이 콘솔에 아직 연결되어 있지 않습니다.

## 14. Cost & Budget

Cost & Budget은 프로젝트의 월 예상 비용을 조회하고 월 예산을 설정·해제하는 흐름입니다.

1. 공통 **Project ID**를 확인합니다.
2. **GET Cost & Budget**을 클릭합니다.
   - 13번 인프라 설정이 아직 저장되지 않았거나 CONNECTED 클라우드 연결이 선택되지 않았다면 `costAvailable: false`가 반환됩니다(404가 아닙니다). 이 경우 콘솔에 "인프라 설정 필요" 안내가 표시되며 `estimatedMonthlyCost`/`resourceCosts` 등은 null 또는 빈 배열입니다.
3. **Monthly Budget Amount (USD)**에 값을 입력하고(예: `50.00`) **PUT Save Budget**을 클릭합니다.
4. 콘솔 하단의 `budgetStatus` 뱃지를 확인합니다 — `NO_BUDGET`(예산 미설정) / `WITHIN_BUDGET` / `OVER_BUDGET` / `NOT_EVALUABLE`(비용 산출 불가) 중 하나입니다.
5. 테스트가 끝나면 **DELETE Budget (해제)**로 정리합니다.

예상:
- 비용은 매 요청마다 저장된 인프라 설정 기준으로 온더플라이 계산되며 저장되지 않습니다(실시간 클라우드 청구 API 호출이 아니라 정적 가격표 기반 추정치입니다).
- 예산(`PUT Save Budget`)은 인프라 설정 여부와 무관하게 언제든 저장할 수 있습니다 — 인프라가 아직 없어도 예산만 먼저 잡아둘 수 있습니다.
- 예산 저장/해제는 멱등입니다: 같은 금액으로 다시 PUT하거나, 예산이 없는 상태에서 DELETE해도 정상 처리(200/204)됩니다.
- `estimatedMonthlyCost`가 예산을 초과하면(`estimatedMonthlyCost > monthlyBudgetAmount`) `OVER_BUDGET`, 그 이하면 `WITHIN_BUDGET`입니다. 비용 산출이 불가능한데(`costAvailable: false`) 예산은 설정되어 있으면 `NOT_EVALUABLE`입니다.

## 참고

- 대부분의 엔드포인트에는 유효한 Access Token이 필요합니다.
- 브라우저에서 `PATCH` 요청이 실패한다면 백엔드 CORS 허용 메서드에 `PATCH`가 포함되어 있는지 확인합니다.
- 새로 생성한 빈 GitHub 레포는 preview 브랜치 준비를 위해 초기 커밋이 필요합니다. 백엔드는 새 레포 생성 시 초기화를 요청하고, 기존 빈 레포는 브랜치가 생길 때까지 preview 브랜치 생성을 건너뜁니다.
- 새 레포 생성은 GitHub App user token이 필요합니다. `bad_refresh_token` 또는 권한 만료 메시지가 나오면 **GitHub App 권한 갱신**을 클릭한 뒤 재시도합니다.
- 별도 배포용 GitHub 레포 바인딩은 사용하지 않습니다. GitHub Pages 배포는 public repository 조건을 따르고, private repository는 외부 클라우드 배포 경로에서 처리합니다.
