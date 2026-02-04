import { google } from "@ai-sdk/google";
import { streamText, tool } from "ai";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { createFetchClient } from "@/lib/fetch-client";

export const maxDuration = 30;

interface EventData {
  id: string;
  title: string;
  type: string;
  date: string;
  records: { amount: number; friend: { name: string; relation: string } }[];
}

interface FriendData {
  id: string;
  name: string;
  relation: string;
  records: { amount: number; event: { title: string; type: string; date: string } }[];
  sentRecords?: { amount: number; date: string; eventType: string; memo: string | null }[];
}

async function getUserData() {
  const session = await auth();
  if (!session?.accessToken) return null;

  const client = createFetchClient(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
  );
  client.setAuthToken(session.accessToken);

  try {
    const [events, friends] = await Promise.all([
      client.get<EventData[]>("/events"),
      client.get<FriendData[]>("/friends"),
    ]);
    return { events, friends, userName: session.user?.name || "사용자", accessToken: session.accessToken };
  } catch {
    return null;
  }
}

function buildSystemPrompt(data: { events: EventData[]; friends: FriendData[]; userName: string }) {
  const { events, friends, userName } = data;

  const totalReceivedRecords = events.reduce((sum, e) => sum + e.records.length, 0);
  const totalReceivedAmount = events.reduce(
    (sum, e) => sum + e.records.reduce((s, r) => s + r.amount, 0),
    0
  );

  const totalSentRecords = friends.reduce((sum, f) => sum + (f.sentRecords?.length || 0), 0);
  const totalSentAmount = friends.reduce(
    (sum, f) => sum + (f.sentRecords?.reduce((s, r) => s + r.amount, 0) || 0),
    0
  );

  const eventSummary = events
    .map((e) => {
      const eventTotal = e.records.reduce((s, r) => s + r.amount, 0);
      return `- ${e.title} (${e.type}, ${new Date(e.date).toLocaleDateString("ko-KR")}): ${e.records.length}명에게 받음, ${eventTotal.toLocaleString()}원`;
    })
    .join("\n");

  const friendSummary = friends
    .slice(0, 20)
    .map((f) => {
      const receivedTotal = f.records.reduce((s, r) => s + r.amount, 0);
      const sentTotal = f.sentRecords?.reduce((s, r) => s + r.amount, 0) || 0;
      const receivedCount = f.records.length;
      const sentCount = f.sentRecords?.length || 0;
      return `- ${f.name} (${f.relation}): 받은 기록 ${receivedCount}건 ${receivedTotal.toLocaleString()}원, 보낸 기록 ${sentCount}건 ${sentTotal.toLocaleString()}원`;
    })
    .join("\n");

  return `당신은 "${userName}"님의 경조사 기록을 관리하는 AI 어시스턴트 "마음장부"입니다.

## 역할
- 사용자의 경조사 내역을 분석하고 인사이트를 제공합니다
- 적정 축의금/부의금 금액을 제안합니다
- 관계별, 이벤트별 통계를 제공합니다
- **이벤트 생성, 지인 추가, 기록 추가 등의 작업을 수행합니다**
- 친근하고 공감하는 한국어로 대화합니다

## 사용 가능한 도구
1. **createEvent**: 새 이벤트(경조사) 생성
   - 사용자가 "이벤트 추가해줘", "결혼식 만들어줘" 등 요청 시 사용
   - type: 결혼, 돌잔치, 생일, 장례, 집들이, 승진, 개업, 기타 중 선택

2. **createFriend**: 새 지인 추가
   - 사용자가 "지인 추가해줘", "친구 등록해줘" 등 요청 시 사용

3. **createRecord**: 받은 기록 추가 (내 이벤트에서 받은 축의금)
   - 사용자가 "OO에게 얼마 받았어" 등 요청 시 사용

4. **createSentRecord**: 보낸 기록 추가 (지인 이벤트에 보낸 축의금)
   - 사용자가 "OO에게 얼마 보냈어" 등 요청 시 사용

## 도구 사용 지침 (매우 중요!)
- **이벤트/지인/기록 생성 요청 시 반드시 도구를 호출해야 합니다**
- **도구를 호출하지 않고 "생성했습니다"라고 말하면 안 됩니다**
- **도구 호출 없이는 데이터가 저장되지 않습니다**
- 정보가 부족하면 먼저 질문하세요 (예: "이벤트 날짜는 언제인가요?")
- 도구 실행 후 결과의 success 값을 확인하고 사용자에게 알려주세요
- 날짜 형식: YYYY-MM-DD (예: 2025-04-01)
- 도구 호출 실패 시 실패했다고 정직하게 알려주세요

## 중요: 데이터 구조 설명
- **records** (받은 기록): 사용자의 이벤트(결혼식 등)에서 지인에게 받은 축의금/부의금
- **sentRecords** (보낸 기록): 사용자가 지인의 이벤트에 보낸 축의금/부의금

## 사용자 데이터 요약
- 총 이벤트 (내 행사): ${events.length}개
- 받은 기록: ${totalReceivedRecords}건, 총 ${totalReceivedAmount.toLocaleString()}원
- 보낸 기록: ${totalSentRecords}건, 총 ${totalSentAmount.toLocaleString()}원

## 이벤트 목록 (내 행사에서 받은 기록)
${eventSummary || "(등록된 이벤트 없음)"}

## 지인 목록 (상위 20명)
${friendSummary || "(등록된 지인 없음)"}

## 상세 데이터
이벤트 상세:
${JSON.stringify(events, null, 2)}

지인 상세:
${JSON.stringify(friends, null, 2)}

## 지침
1. "~에게 보냈는지" 물으면 sentRecords 데이터를 확인하세요
2. "~에게 받았는지" 물으면 records 데이터를 확인하세요
3. 데이터에 없는 내용은 절대 추측하지 말고 "기록이 없습니다"라고 안내하세요
4. 금액 제안 시 관계, 이전 기록, 한국 문화를 고려하세요
5. 응답은 간결하고 친근하게 작성하세요`;
}

export async function POST(req: Request) {
  console.log("[POST] /api/chat 호출됨");

  const session = await auth();
  if (!session) {
    console.log("[POST] 인증 실패");
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages } = await req.json();
  console.log("[POST] 메시지 수:", messages.length, "마지막 메시지:", messages[messages.length - 1]?.content?.slice(0, 50));
  const userData = await getUserData();

  if (!userData) {
    return new Response("Failed to load user data", { status: 500 });
  }

  const apiClient = createFetchClient(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
  );
  apiClient.setAuthToken(userData.accessToken);

  const result = streamText({
    model: google("gemini-2.5-flash-lite"),
    system: buildSystemPrompt(userData),
    messages,
    tools: {
      createEvent: tool({
        description: "새로운 이벤트(경조사)를 생성합니다. 결혼식, 돌잔치, 생일, 장례식, 집들이, 승진, 개업 등의 이벤트를 추가할 때 사용합니다.",
        parameters: z.object({
          title: z.string().describe("이벤트 제목 (예: 나의 결혼식, 아들 돌잔치)"),
          type: z.enum(["결혼", "돌잔치", "생일", "장례", "집들이", "승진", "개업", "기타"]).describe("이벤트 유형"),
          date: z.string().describe("이벤트 날짜 (YYYY-MM-DD 형식)"),
        }),
        execute: async ({ title, type, date }) => {
          console.log("[createEvent] 도구 호출됨:", { title, type, date });
          try {
            const event = await apiClient.post("/events", { title, type, date });
            console.log("[createEvent] 성공:", event);
            return { success: true, event, message: `"${title}" 이벤트가 생성되었습니다!` };
          } catch (error) {
            console.error("[createEvent] 실패:", error);
            return { success: false, message: "이벤트 생성에 실패했습니다." };
          }
        },
      }),

      createFriend: tool({
        description: "새로운 지인을 추가합니다.",
        parameters: z.object({
          name: z.string().describe("지인 이름"),
          relation: z.string().describe("관계 (예: 친구, 직장 동료, 가족, 친척, 선후배)"),
        }),
        execute: async ({ name, relation }) => {
          console.log("[createFriend] 도구 호출됨:", { name, relation });
          try {
            const friend = await apiClient.post("/friends", { name, relation });
            console.log("[createFriend] 성공:", friend);
            return { success: true, friend, message: `"${name}"님이 지인으로 추가되었습니다!` };
          } catch (error) {
            console.error("[createFriend] 실패:", error);
            return { success: false, message: "지인 추가에 실패했습니다." };
          }
        },
      }),

      createRecord: tool({
        description: "내 이벤트에서 받은 축의금/부의금 기록을 추가합니다. 먼저 이벤트와 지인이 등록되어 있어야 합니다.",
        parameters: z.object({
          eventId: z.string().describe("이벤트 ID"),
          friendId: z.string().describe("지인 ID"),
          amount: z.number().describe("금액 (원)"),
          memo: z.string().optional().describe("메모 (선택)"),
        }),
        execute: async ({ eventId, friendId, amount, memo }) => {
          console.log("[createRecord] 도구 호출됨:", { eventId, friendId, amount, memo });
          try {
            const record = await apiClient.post("/records", { eventId, friendId, amount, memo });
            console.log("[createRecord] 성공:", record);
            return { success: true, record, message: `${amount.toLocaleString()}원 받은 기록이 추가되었습니다!` };
          } catch (error) {
            console.error("[createRecord] 실패:", error);
            return { success: false, message: "기록 추가에 실패했습니다." };
          }
        },
      }),

      createSentRecord: tool({
        description: "지인의 이벤트에 보낸 축의금/부의금 기록을 추가합니다. 먼저 지인이 등록되어 있어야 합니다.",
        parameters: z.object({
          friendId: z.string().describe("지인 ID"),
          amount: z.number().describe("금액 (원)"),
          date: z.string().describe("보낸 날짜 (YYYY-MM-DD 형식)"),
          eventType: z.enum(["결혼", "돌잔치", "생일", "장례", "집들이", "승진", "개업", "기타"]).describe("이벤트 유형"),
          memo: z.string().optional().describe("메모 (선택)"),
        }),
        execute: async ({ friendId, amount, date, eventType, memo }) => {
          console.log("[createSentRecord] 도구 호출됨:", { friendId, amount, date, eventType, memo });
          try {
            const record = await apiClient.post("/sent-records", { friendId, amount, date, eventType, memo });
            console.log("[createSentRecord] 성공:", record);
            return { success: true, record, message: `${amount.toLocaleString()}원 보낸 기록이 추가되었습니다!` };
          } catch (error) {
            console.error("[createSentRecord] 실패:", error);
            return { success: false, message: "기록 추가에 실패했습니다." };
          }
        },
      }),
    },
    maxSteps: 5,
    toolChoice: "auto",
    onStepFinish: ({ stepType, toolCalls, toolResults, text }) => {
      console.log("[streamText] Step finished:", {
        stepType,
        toolCalls: toolCalls?.map(tc => ({ name: tc.toolName, args: tc.args })),
        toolResults: toolResults?.map(tr => ({ name: tr.toolName, result: tr.result })),
        textLength: text?.length,
      });
    },
  });

  console.log("[POST] streamText 시작됨");
  return result.toTextStreamResponse();
}
