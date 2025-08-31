# 생수가 흐르는 교회 홈페이지 💒

생수가 흐르는 교회의 공식 웹사이트입니다. Next.js 15와 현대적인 웹 기술을 사용하여 구축되었습니다.

## 프로젝트 개요

이 프로젝트는 교회의 다양한 정보와 콘텐츠를 제공하는 웹사이트로, 다음과 같은 주요 기능들을 포함합니다:

- 📖 교회 소개 및 목사님 소개
- 🎵 찬송가 및 영의 말씀
- 📰 교회 소식 및 공지사항
- 🎤 설교 영상 및 자료
- 📍 교회 위치 및 정보
- 👥 관리자 페이지 (콘텐츠 관리)

## 기술 스택

### 프레임워크 & 언어
- **Next.js 15** - React 기반 풀스택 프레임워크
- **TypeScript** - 타입 안정성을 위한 정적 타입 언어
- **React 19** - 사용자 인터페이스 라이브러리

### 스타일링 & UI
- **Tailwind CSS 4** - 유틸리티 기반 CSS 프레임워크
- **Radix UI** - 접근성 중심의 UI 컴포넌트 라이브러리
- **Framer Motion** - 애니메이션 라이브러리
- **Lucide React** - 아이콘 라이브러리

### 상태관리 & 데이터 페칭
- **TanStack Query** - 서버 상태 관리
- **SWR** - 데이터 페칭 라이브러리
- **Zustand** - 클라이언트 상태 관리

### 데이터베이스 & 스토리지
- **Neon Database** - PostgreSQL 클라우드 데이터베이스
- **Drizzle ORM** - TypeScript ORM
- **Google Cloud Storage** - 파일 스토리지

### 국제화 & 기타
- **next-intl** - 다국어 지원
- **next-themes** - 다크모드 지원
- **Vercel Analytics** - 웹 분석

## 프로젝트 구조

```
app/
├── [locale]/                 # 다국어 라우팅
│   ├── admin/               # 관리자 페이지
│   ├── introduces/          # 교회 소개
│   ├── sermons/             # 설교
│   ├── news/                # 소식
│   ├── hymns/               # 찬송가
│   ├── infos/               # 정보
│   └── page.tsx             # 홈 페이지
├── components/              # 재사용 컴포넌트
│   ├── ui/                  # 기본 UI 컴포넌트
│   ├── layout/              # 레이아웃 컴포넌트
│   ├── cards/               # 카드 컴포넌트
│   ├── admin/               # 관리자 컴포넌트
│   └── magicui/             # 고급 UI 컴포넌트
├── lib/                     # 유틸리티 및 설정
└── globals.css              # 전역 스타일
```

## 주요 기능

### 1. 반응형 레이아웃
- 모바일, 태블릿, 데스크톱 지원
- 사이드바 내비게이션 (데스크톱)
- 바텀 독 네비게이션 (모바일)

### 2. 콘텐츠 관리
- 관리자 페이지를 통한 콘텐츠 CRUD
- 이미지 업로드 및 관리
- 실시간 콘텐츠 업데이트

### 3. 검색 기능
- 전체 콘텐츠 통합 검색
- 카테고리별 필터링
- 실시간 검색 결과

### 4. 멀티미디어 지원
- 이미지 갤러리
- 동영상 재생
- 반응형 미디어 뷰어

## 시작하기

### 개발 서버 실행

```bash
yarn dev
# 또는
npm run dev
```

http://localhost:3000 에서 결과를 확인할 수 있습니다.

### 빌드 및 배포

```bash
# 프로덕션 빌드
yarn build

# 프로덕션 서버 시작
yarn start
```

### 기타 스크립트

```bash
# 코드 린팅
yarn lint

# 코드 포맷팅
yarn pretty

# 컴포넌트 테스트
yarn test-ct
```

## 환경 설정

프로젝트 실행을 위해 다음 환경 변수들이 필요합니다:

```env
# 데이터베이스
DATABASE_URL=

# Google Cloud Storage
GOOGLE_CLOUD_PROJECT_ID=
GOOGLE_CLOUD_KEY_FILE=

# 기타 설정
NEXT_PUBLIC_SITE_URL=
```

## 최근 업데이트

- 🔨 목사님 사진 수정
- 🔨 search 영의 말씀 아이콘 추가
- 🔨 search 분리
- 🔨 타입 재정의
- 🔨 어드민 페이지 개발 (모바일 drawer, 소식 CRUD, motion-effect)
