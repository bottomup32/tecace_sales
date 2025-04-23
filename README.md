# TecAce 마크다운 문서 뷰어

이 애플리케이션은 TecAce의 미국 시장 진출 전략 관련 마크다운 문서들을 웹에서 쉽게 볼 수 있고, 편집 및 저장할 수 있도록 만들어진 Next.js 애플리케이션입니다.

## 기능

- 마크다운 문서 목록 보기
- 마크다운 문서 내용 보기 (구문 강조 지원)
- 마크다운 문서 편집 및 저장
- 반응형 UI (모바일, 태블릿, 데스크톱 지원)
- 다크 모드 지원

## 설치 및 실행 방법

### 필수 조건

- Node.js 16 이상
- npm 또는 yarn

### 설치

1. 저장소를 클론하거나 다운로드 합니다.
2. 프로젝트 디렉토리로 이동합니다.
3. 의존성 패키지를 설치합니다:

```bash
npm install
# 또는
yarn install
```

### 개발 모드로 실행

```bash
npm run dev
# 또는
yarn dev
```

브라우저에서 http://localhost:3000 으로 접속하여 애플리케이션을 확인할 수 있습니다.

### 프로덕션 빌드

```bash
npm run build
npm start
# 또는
yarn build
yarn start
```

## 기술 스택

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui 컴포넌트
- react-markdown
- localStorage (문서 저장용)

## 참고 사항

이 애플리케이션은 문서 내용을 브라우저의 localStorage에 저장합니다. 서버 저장 기능을 추가하려면 별도의 백엔드 API가 필요합니다. 