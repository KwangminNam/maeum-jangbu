import { test, expect } from "@playwright/test";
import { mockAuth, mockEventsApi, mockFriendsApi } from "./helpers/mock";

test.describe("전체 플로우: 로그인 > 이벤트 등록 > 지인 등록", () => {
  test("로그인 페이지에서 대시보드까지 네비게이션", async ({ page }) => {
    // 1. 로그인 페이지 확인
    await page.goto("/");
    await expect(page.getByRole("button", { name: /카카오로 시작하기/ })).toBeVisible();

    // 2. 인증 mock 설정 후 대시보드로 이동
    await mockAuth(page);
    await mockEventsApi(page);
    await page.goto("/dashboard");

    // 3. 대시보드가 정상적으로 로드됨
    await expect(page.getByRole("heading", { name: "경조사 내역" })).toBeVisible();
    await expect(page.getByText("이벤트 목록")).toBeVisible();
  });

  test("대시보드에서 새 이벤트 등록 후 돌아오기", async ({ page }) => {
    await mockAuth(page);
    await mockEventsApi(page);

    // 1. 대시보드에서 시작
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "경조사 내역" })).toBeVisible();

    // 2. 새 이벤트 버튼 클릭
    await page.getByRole("link", { name: /새 이벤트/ }).click();
    await page.waitForURL("/dashboard/events/new");

    // 3. 이벤트 폼 작성
    await expect(page.getByRole("heading", { name: "새 이벤트" })).toBeVisible();

    await page.getByRole("button", { name: /💒 결혼식/ }).click();
    await page.locator("#title").fill("나의 결혼식");
    await page.getByText("날짜를 선택하세요").click();
    await page.getByText("오늘").click();

    // 4. 등록
    await page.getByRole("button", { name: /이벤트 등록하기/ }).click();

    // 5. 성공 확인 및 대시보드 복귀
    await expect(page.getByText("이벤트가 등록되었습니다!")).toBeVisible();
    await page.waitForURL("/dashboard");
  });

  test("대시보드에서 지인 탭으로 이동 후 지인 등록", async ({ page }) => {
    await mockAuth(page);
    await mockFriendsApi(page);

    // 1. 대시보드에서 시작
    await page.goto("/dashboard");

    // 2. 하단 탭바에서 지인 탭 클릭
    await page.getByRole("link", { name: "지인" }).click();
    await page.waitForURL("/dashboard/friends");

    // 3. 지인 페이지 확인
    await expect(page.getByRole("heading", { name: "지인 관리" })).toBeVisible();

    // 4. 지인 추가
    await page.getByRole("button", { name: /추가/ }).click();
    await page.locator("#name").fill("김철수");
    const dialog = page.locator("[role='dialog']");
    await dialog.getByRole("button", { name: "직장 동료" }).click();
    await page.getByRole("button", { name: "추가하기" }).click();

    // 5. 추가 확인
    await expect(page.locator("[role='dialog']")).not.toBeVisible();
    await expect(page.getByText("김철수")).toBeVisible();
  });

  test("전체 플로우: 이벤트 등록 → 지인 등록", async ({ page }) => {
    await mockAuth(page);
    await mockEventsApi(page);
    await mockFriendsApi(page);

    // ── Step 1: 이벤트 등록 ──
    await page.goto("/dashboard/events/new");

    // 폼 작성
    await page.getByRole("button", { name: /🕯️ 장례식/ }).click();
    await page.locator("#title").fill("할머니 장례식");
    await page.getByText("날짜를 선택하세요").click();
    await page.getByText("오늘").click();

    // 등록
    await page.getByRole("button", { name: /이벤트 등록하기/ }).click();
    await expect(page.getByText("이벤트가 등록되었습니다!")).toBeVisible();
    await page.waitForURL("/dashboard");

    // ── Step 2: 지인 탭으로 이동 ──
    await page.getByRole("link", { name: "지인" }).click();
    await page.waitForURL("/dashboard/friends");

    // ── Step 3: 지인 추가 ──
    await page.getByRole("button", { name: /추가/ }).click();
    await page.locator("#name").fill("박민수");
    const dialog = page.locator("[role='dialog']");
    await dialog.getByRole("button", { name: "가족" }).click();
    await page.getByRole("button", { name: "추가하기" }).click();

    // 추가 확인
    await expect(page.locator("[role='dialog']")).not.toBeVisible();
    await expect(page.getByText("박민수")).toBeVisible();
  });

  test("하단 탭바 네비게이션이 정상 동작한다", async ({ page }) => {
    await mockAuth(page);
    await mockEventsApi(page);
    await mockFriendsApi(page);

    await page.goto("/dashboard");

    // 경조사 탭 활성 상태 확인
    const eventsTab = page.getByRole("link", { name: "경조사" });
    await expect(eventsTab).toHaveClass(/text-primary/);

    // 지인 탭 클릭
    await page.getByRole("link", { name: "지인" }).click();
    await page.waitForURL("/dashboard/friends");
    await expect(page.getByRole("heading", { name: "지인 관리" })).toBeVisible();

    // AI 비서 탭 클릭
    await page.getByRole("link", { name: "AI 비서" }).click();
    await page.waitForURL("/dashboard/chat");

    // 다시 경조사 탭으로
    await page.getByRole("link", { name: "경조사" }).click();
    await page.waitForURL("/dashboard");
    await expect(page.getByRole("heading", { name: "경조사 내역" })).toBeVisible();
  });
});
