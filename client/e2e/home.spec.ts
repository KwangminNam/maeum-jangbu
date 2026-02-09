import { test, expect } from "@playwright/test";

test.describe("홈페이지 (로그인)", () => {
  test("페이지가 정상적으로 로드된다", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/마음장부/);
  });

  test("로고와 앱 이름이 표시된다", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("h1")).toHaveText("마음장부");
    await expect(page.getByText("경조사 내역을 기록하고")).toBeVisible();
    await expect(page.getByText("AI가 적정 금액을 제안해드려요")).toBeVisible();
  });

  test("카카오 로그인 버튼이 표시된다", async ({ page }) => {
    await page.goto("/");

    const kakaoButton = page.getByRole("button", { name: /카카오로 시작하기/ });
    await expect(kakaoButton).toBeVisible();
  });

  test("서비스 이용약관 안내 문구가 표시된다", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByText("로그인 시 서비스 이용약관에 동의하게 됩니다")
    ).toBeVisible();
  });
});
