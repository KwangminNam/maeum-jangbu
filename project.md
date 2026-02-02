1. 프로젝트 개요
• 서비스명: 마음장부 (Maum-Jangbu)
• 핵심 목적: 사용자의 경조사(축의금, 부조금) 내역을 체계적으로 기록하고, AI가 과거 내역과 현재 물가를 분석하여 적정 보답 금액을 제안하는 서비스.
• 타겟 사용자: 인맥 관리가 중요한 직장인 및 경조사 데이터 정리가 필요한 혼주/상주.

나는 프론트엔드 개발자라서 nestjs,db등 이걸 잘몰라서 너한테 맡길거임.
그래서 아래 데이터 스키마나 설계가 변동 될수도있음 너에따라서
2. 기술 스택 (Tech Stack) 
pnpm, 모노레포로 아래 두가지 구조로 가지게한다.
client
server 
2.1 Frontend
• Framework: Next.js (App Router)
• Auth: NextAuth.js (Google, Kakao Social Login)
• State Management: Zustand
• Async Pattern: React Suspense + use Hook (Promise 기반 선언적 처리)
• Error Handling: react-error-boundary
• UI Components: shadcn/ui, Tailwind CSS
• Deployment: Vercel
2.2 Backend & Database
• Framework: Nest.js
• ORM: Prisma
• Database: PostgreSQL (Supabase 활용)
• AI: OpenAI API (GPT-4o/4o-mini) + Function Calling
• Deployment: Railway (Server), Supabase (DB)
3. 핵심 기능 및 UX 설계
3.1 사용자 인증 (Authentication)
• 유저별 독립적 데이터 격리를 위해 소셜 로그인 필수.
• 클라이언트(Next.js)와 서버(Nest.js) 간 JWT 인증 연동을 통해 데이터 보안 확보.
3.2 스마트 데이터 입력 (Smart Entry)
• 1:N 일괄 등록:
• [5만 / 10만 / 20만 / 직접입력] 뱃지 선택 후, 해당 금액을 낸 지인들을 다중 선택하여 한 번에 저장.
• 스마트 텍스트 파서:
• 카톡이나 문자로 받은 내역 뭉치를 복사-붙여넣기 하면 AI가 이름/금액을 추출하여 프리필(Pre-fill).
• AI OCR (고도화 예정):
• 수기 방명록이나 봉투 사진을 찍으면 텍스트를 인식하여 자동 데이터화.
3.3 관리 UI (Dashboard)
• 이벤트 관리: '나의 결혼식', '아버지 칠순' 등 대분류 생성 및 통계 확인.
• 지인 타임라인: 특정 지인과 주고받은 모든 경조사 히스토리를 한눈에 확인.
• 관계 설정: '친구', '직장', '가족' 등 기본 카테고리 + 직접 입력(Hybrid 방식).
3.4 AI 채팅 비서 (AI Agent)
• 자연어 조회: "홍길동이 내 결혼식 때 얼마 냈어?" 등 과거 데이터 즉시 응답.
• 지능형 제안:
• 과거 금액을 현재 물가(식대 상승률 등)로 환산하여 가치 분석.
• 관계의 깊이와 현재 시장 상황을 고려한 '적정 보답 금액' 추천.
4. 데이터베이스 스키마 (Prisma Model)
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  events    Event[]
  friends   Friend[]
  createdAt DateTime @default(now())
}

model Event {
  id        String   @id @default(uuid())
  title     String   // 내 결혼식, 부친 장례식 등
  type      String   // WEDDING, FUNERAL, ETC
  date      DateTime
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  records   Record[]
}

model Friend {
  id        String   @id @default(uuid())
  name      String
  relation  String   // '직장 동료', '고교 동창' 등 자유 입력
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  records   Record[]
}

model Record {
  id        String   @id @default(uuid())
  amount    Int      // 금액 (원 단위)
  memo      String?
  friendId  String
  friend    Friend   @relation(fields: [friendId], references: [id])
  eventId   String
  event     Event    @relation(fields: [eventId], references: [id])
  createdAt DateTime @default(now())
}
