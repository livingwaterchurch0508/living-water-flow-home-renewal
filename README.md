# Living Water Home

생수의강 교회 웹사이트 프로젝트입니다. Next.js 15 App Router 기반으로 한국어/영어 다국어를 지원합니다.

## 주요 기능

- **설교 관리** - 레마/소울 설교 영상 관리 및 조회
- **찬양 관리** - 찬송가/복음성가 영상 관리
- **소식 관리** - 예배/행사/이야기 게시물 및 이미지 관리
- **관리자 대시보드** - 콘텐츠 CRUD, 통계 조회
- **다국어 지원** - 한국어(기본)/영어 자동 라우팅
- **통합 검색** - 설교, 찬양, 소식 전체 검색

## 기술 스택

- **프레임워크**: Next.js 15, React 19, TypeScript
- **데이터베이스**: PostgreSQL (Neon Serverless) + Drizzle ORM
- **스타일링**: Tailwind CSS 4, Radix UI
- **다국어**: next-intl
- **데이터 페칭**: TanStack React Query
- **스토리지**: Google Cloud Storage
- **테스트**: Playwright

## 시작하기

### 환경 변수 설정

`.env.local` 파일을 생성하고 필요한 환경 변수를 설정합니다:

```env
DATABASE_URL=your_neon_database_url
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_CLOUD_BUCKET_NAME=your_bucket_name
```

### 설치 및 실행

```bash
# 의존성 설치
yarn install

# 개발 서버 실행
yarn dev

# 프로덕션 빌드
yarn build

# 프로덕션 서버 실행
yarn start
```

개발 서버 실행 후 [http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `yarn dev` | 개발 서버 실행 (Turbopack) |
| `yarn build` | 프로덕션 빌드 |
| `yarn start` | 프로덕션 서버 실행 |
| `yarn lint` | ESLint 검사 |
| `yarn pretty` | Prettier 포맷팅 |
| `yarn playwright test` | Playwright 테스트 실행 |

## 프로젝트 구조

```
app/
├── [locale]/           # 다국어 라우팅 (ko, en)
│   ├── admin/          # 관리자 페이지
│   ├── sermons/        # 설교 페이지
│   ├── hymns/          # 찬양 페이지
│   ├── news/           # 소식 페이지
│   ├── introduces/     # 교회 소개 페이지
│   └── infos/          # 오시는 길 페이지
├── api/                # API 라우트
├── components/         # React 컴포넌트
├── hooks/              # 커스텀 훅
├── lib/                # 유틸리티 및 DB 로직
└── variables/          # 상수, 열거형, 타입
messages/               # 다국어 번역 파일
```

## 배포

Vercel을 통해 배포할 수 있습니다.

```bash
vercel deploy
```

## 라이선스

Private