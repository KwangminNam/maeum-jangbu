import { Page } from "@playwright/test";

const API_URL = "http://localhost:3001";
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "jugHOf2GicuaF3H6RR1lE2vWblA00ed3p8bHt6dHYM0=";
const COOKIE_NAME = "authjs.session-token";

const MOCK_SESSION = {
  user: {
    id: "test-user-id",
    name: "테스트 사용자",
    email: "test@example.com",
    image: null,
  },
  accessToken: "mock-access-token",
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
};

export const MOCK_EVENTS = [
  {
    id: "event-1",
    title: "나의 결혼식",
    type: "WEDDING",
    date: "2025-06-15",
    records: [{ amount: 50000 }, { amount: 100000 }],
  },
  {
    id: "event-2",
    title: "아버지 칠순",
    type: "BIRTHDAY",
    date: "2025-08-20",
    records: [{ amount: 30000 }],
  },
];

export const MOCK_FRIENDS = [
  {
    id: "friend-1",
    name: "김철수",
    relation: "친구",
    records: [{ amount: 50000, event: { type: "WEDDING" } }],
    sentRecords: [],
  },
  {
    id: "friend-2",
    name: "이영희",
    relation: "직장 동료",
    records: [{ amount: 100000, event: { type: "WEDDING" } }],
    sentRecords: [{ amount: 50000, eventType: "BIRTHDAY" }],
  },
];

/**
 * NextAuth v5 JWE 세션 토큰 생성
 * - HKDF로 암호화 키 유도
 * - A256CBC-HS512 JWE로 암호화
 */
async function createSessionToken(): Promise<string> {
  const { encode } = await import("next-auth/jwt");
  const token = await encode({
    token: {
      name: "테스트 사용자",
      email: "test@example.com",
      sub: "test-user-id",
      userId: "test-user-id",
    },
    secret: NEXTAUTH_SECRET,
    salt: COOKIE_NAME,
  });
  return token;
}

export async function mockAuth(page: Page) {
  // 1. 서버 사이드 인증을 위한 실제 세션 쿠키 설정
  const sessionToken = await createSessionToken();
  await page.context().addCookies([
    {
      name: COOKIE_NAME,
      value: sessionToken,
      domain: "localhost",
      path: "/",
    },
  ]);

  // 2. 클라이언트 사이드 SessionProvider를 위한 API 모킹
  await page.route("**/api/auth/session", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_SESSION),
    });
  });

  await page.route("**/api/auth/csrf", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ csrfToken: "mock-csrf-token" }),
    });
  });

  await page.route("**/api/auth/providers", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        kakao: {
          id: "kakao",
          name: "Kakao",
          type: "oauth",
          signinUrl: "/api/auth/signin/kakao",
          callbackUrl: "/api/auth/callback/kakao",
        },
      }),
    });
  });
}

export async function mockEventsApi(page: Page) {
  // 서버 사이드 fetch도 모킹 (Next.js 서버에서 백엔드 호출)
  await page.route(`${API_URL}/events`, async (route) => {
    const method = route.request().method();

    if (method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ result: MOCK_EVENTS, error: null }),
      });
    } else if (method === "POST") {
      const body = route.request().postDataJSON();
      const newEvent = {
        id: "new-event-id",
        ...body,
        records: [],
      };
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ result: newEvent, error: null }),
      });
    }
  });
}

export async function mockFriendsApi(page: Page) {
  await page.route(`${API_URL}/friends`, async (route) => {
    const method = route.request().method();

    if (method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ result: MOCK_FRIENDS, error: null }),
      });
    } else if (method === "POST") {
      const body = route.request().postDataJSON();
      const newFriend = {
        id: `friend-${Date.now()}`,
        ...body,
        records: [],
        sentRecords: [],
      };
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ result: newFriend, error: null }),
      });
    }
  });
}

export async function mockAllApis(page: Page) {
  await mockAuth(page);
  await mockEventsApi(page);
  await mockFriendsApi(page);
}
