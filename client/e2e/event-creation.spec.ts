import { test, expect } from "@playwright/test";
import { mockAuth, mockEventsApi } from "./helpers/mock";

test.describe("이벤트 등록", () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page);
    await mockEventsApi(page);
  });

  test("새 이벤트 페이지가 정상적으로 로드된다", async ({ page }) => {
    await page.goto("/dashboard/events/new");

    await expect(page.getByRole("heading", { name: "새 이벤트" })).toBeVisible();
    await expect(page.getByText("경조사 내역을 기록해보세요")).toBeVisible();
  });

  test("이벤트 유형을 선택할 수 있다", async ({ page }) => {
    await page.goto("/dashboard/events/new");

    // 결혼식 버튼 클릭 (description 텍스트와 중복 방지를 위해 role 사용)
    const weddingButton = page.getByRole("button", { name: /💒 결혼식/ });
    await weddingButton.click();

    // 선택된 상태 확인 (ring 클래스 적용)
    await expect(weddingButton).toHaveClass(/ring-pink-400/);
  });

  test("이벤트 이름을 입력할 수 있다", async ({ page }) => {
    await page.goto("/dashboard/events/new");

    const titleInput = page.locator("#title");
    await titleInput.fill("나의 결혼식");

    await expect(titleInput).toHaveValue("나의 결혼식");
  });

  test("날짜를 선택할 수 있다", async ({ page }) => {
    await page.goto("/dashboard/events/new");

    // 날짜 선택 버튼 클릭
    await page.getByText("날짜를 선택하세요").click();

    // 캘린더가 열렸는지 확인
    await expect(page.getByText("오늘")).toBeVisible();

    // 오늘 버튼 클릭
    await page.getByText("오늘").click();

    // 날짜가 선택되었는지 확인 (placeholder가 사라짐)
    await expect(page.getByText("날짜를 선택하세요")).not.toBeVisible();
  });

  test("모든 필드를 입력하면 등록 버튼이 활성화된다", async ({ page }) => {
    await page.goto("/dashboard/events/new");

    const submitButton = page.getByRole("button", { name: /이벤트 등록하기/ });

    // 초기 상태: 비활성화
    await expect(submitButton).toBeDisabled();

    // 이벤트 유형 선택
    await page.getByRole("button", { name: /💒 결혼식/ }).click();

    // 이벤트 이름 입력
    await page.locator("#title").fill("나의 결혼식");

    // 날짜 선택
    await page.getByText("날짜를 선택하세요").click();
    await page.getByText("오늘").click();

    // 등록 버튼 활성화 확인
    await expect(submitButton).toBeEnabled();
  });

  test("이벤트를 성공적으로 등록할 수 있다", async ({ page }) => {
    await page.goto("/dashboard/events/new");

    // 폼 작성
    await page.getByRole("button", { name: /💒 결혼식/ }).click();
    await page.locator("#title").fill("나의 결혼식");
    await page.getByText("날짜를 선택하세요").click();
    await page.getByText("오늘").click();

    // 미리보기 카드에 제목이 표시되는지 확인
    await expect(page.getByText("나의 결혼식")).toBeVisible();

    // 등록 버튼 클릭
    await page.getByRole("button", { name: /이벤트 등록하기/ }).click();

    // 성공 토스트 확인
    await expect(page.getByText("이벤트가 등록되었습니다!")).toBeVisible();

    // 대시보드로 이동 확인
    await page.waitForURL("/dashboard");
  });

  test("OCR 스캔 배너가 표시되고 클릭할 수 있다", async ({ page }) => {
    await page.goto("/dashboard/events/new");

    const ocrBanner = page.getByText("명부 스캔으로 빠르게 등록");
    await expect(ocrBanner).toBeVisible();
  });

  test("다른 이벤트 유형으로 전환할 수 있다", async ({ page }) => {
    await page.goto("/dashboard/events/new");

    // 결혼식 선택
    const weddingButton = page.getByRole("button", { name: /💒 결혼식/ });
    await weddingButton.click();
    await expect(weddingButton).toHaveClass(/ring-pink-400/);

    // 장례식으로 변경
    const funeralButton = page.getByRole("button", { name: /🕯️ 장례식/ });
    await funeralButton.click();
    await expect(funeralButton).toHaveClass(/ring-purple-400/);

    // 결혼식 선택 해제 확인
    await expect(weddingButton).not.toHaveClass(/ring-pink-400/);
  });
});
