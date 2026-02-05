# 마음장부 2026.02.03 ~ WIP 
https://maeum-jangbu.vercel.app/

> **Vibe Coding**
> 개발자는 설계와 의사결정만 하고, Claude에게 개발 통제권을 넘겨서 빠르지만 안전하게 

## 프로젝트 소개

경조사 내역을 관리하고 AI가 적정 금액을 제안 및 생성 해주는 서비스입니다.

- 결혼식, 장례식, 생일 등 경조사 이벤트 관리
- 지인별 주고받은 금액 기록
- AI 비서를 통한 기록 분석 및 적정 금액 추천

## 로드맵

Step by step으로 AI로 빠른 시간 내 진행합니다.

| Step | 내용 | 상태 |
|------|------|------|
| 1 | 기능 구현 | 진행중 |
| 2 | 테스트 코드 추가 | 예정 |
| 3 | 리팩토링 | 예정 |
| 4 | 개선 | 예정 |
| 5 | OCR 기능 추가 (조의금 방명록 인식) | 예정 |

## 기술 스택

**Client:** Next.js 16, TypeScript, Tailwind CSS, NextAuth.js (Kakao OAuth), Framer Motion

**Server:** NestJS, Prisma, PostgreSQL, Google Generative AI (Gemini)

**Infra:** Vercel (Client), AWS Lambda via SST (Server), Supabase (DB)

## 모노레포 구조

```

├── client/          # Next.js 프론트엔드
│   └── src/
│       ├── app/     # App Router
│       ├── components/
│       └── lib/
├── server/          # NestJS 백엔드
│   └── src/
│       ├── auth/    # JWT 인증
│       ├── user/
│       ├── event/
│       ├── friend/
│       ├── record/
│       └── ai/      # Gemini 통합
├── stacks/          # SST 인프라
└── pnpm-workspace.yaml
```

## 로컬 개발

```bash
pnpm install

# Client
cd client && pnpm dev

# Server
cd server && pnpm start:dev
```

## 배포

```bash
# Lambda 배포
pnpm sst deploy --stage prod
```

Client는 Vercel에 자동 배포됩니다.
