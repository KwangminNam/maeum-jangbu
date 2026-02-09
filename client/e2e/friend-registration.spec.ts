import { test, expect } from "@playwright/test";
import { mockAuth, mockFriendsApi } from "./helpers/mock";

test.describe("지인 등록", () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page);
    await mockFriendsApi(page);
  });

  test("지인 관리 페이지가 정상적으로 로드된다", async ({ page }) => {
    await page.goto("/dashboard/friends");

    await expect(page.getByRole("heading", { name: "지인 관리" })).toBeVisible();
    await expect(page.getByText("소중한 인연을 관리하세요")).toBeVisible();
  });

  test("추가 버튼을 클릭하면 다이얼로그가 열린다", async ({ page }) => {
    await page.goto("/dashboard/friends");

    await page.getByRole("button", { name: /추가/ }).click();

    // 다이얼로그 확인
    await expect(page.getByText("지인 추가")).toBeVisible();
    await expect(page.locator("#name")).toBeVisible();
    await expect(page.locator("#relation")).toBeVisible();
  });

  test("이름과 관계를 입력할 수 있다", async ({ page }) => {
    await page.goto("/dashboard/friends");
    await page.getByRole("button", { name: /추가/ }).click();

    // 이름 입력
    await page.locator("#name").fill("박지민");
    await expect(page.locator("#name")).toHaveValue("박지민");

    // 관계 입력
    await page.locator("#relation").fill("고교 동창");
    await expect(page.locator("#relation")).toHaveValue("고교 동창");
  });

  test("관계 추천 버튼으로 빠르게 선택할 수 있다", async ({ page }) => {
    await page.goto("/dashboard/friends");
    await page.getByRole("button", { name: /추가/ }).click();

    // 관계 추천 버튼 클릭
    const dialog = page.locator("[role='dialog']");
    await dialog.getByRole("button", { name: "직장 동료" }).click();

    await expect(page.locator("#relation")).toHaveValue("직장 동료");
  });

  test("이름과 관계가 모두 입력되어야 추가하기 버튼이 활성화된다", async ({
    page,
  }) => {
    await page.goto("/dashboard/friends");
    await page.getByRole("button", { name: /추가/ }).click();

    const submitButton = page.getByRole("button", { name: "추가하기" });

    // 초기 상태: 비활성화
    await expect(submitButton).toBeDisabled();

    // 이름만 입력
    await page.locator("#name").fill("박지민");
    await expect(submitButton).toBeDisabled();

    // 관계도 입력
    const dialog = page.locator("[role='dialog']");
    await dialog.getByRole("button", { name: "친구" }).click();

    // 활성화 확인
    await expect(submitButton).toBeEnabled();
  });

  test("지인을 성공적으로 추가할 수 있다", async ({ page }) => {
    await page.goto("/dashboard/friends");
    await page.getByRole("button", { name: /추가/ }).click();

    // 폼 작성
    await page.locator("#name").fill("박지민");
    const dialog = page.locator("[role='dialog']");
    await dialog.getByRole("button", { name: "친구" }).click();

    // 추가하기 클릭
    await page.getByRole("button", { name: "추가하기" }).click();

    // 다이얼로그가 닫힘
    await expect(page.locator("[role='dialog']")).not.toBeVisible();

    // 목록에 새 지인이 표시됨
    await expect(page.getByText("박지민")).toBeVisible();
  });

  test("검색 기능이 동작한다", async ({ page }) => {
    await page.goto("/dashboard/friends");

    // 지인 추가 (목록에 데이터가 있어야 검색 가능)
    await page.getByRole("button", { name: /추가/ }).click();
    await page.locator("#name").fill("박지민");
    const dialog = page.locator("[role='dialog']");
    await dialog.getByRole("button", { name: "친구" }).click();
    await page.getByRole("button", { name: "추가하기" }).click();
    await expect(page.locator("[role='dialog']")).not.toBeVisible();

    // 검색
    const searchInput = page.getByPlaceholder("이름으로 검색");
    await searchInput.fill("박지민");
    await expect(page.getByText("박지민")).toBeVisible();

    // 없는 이름 검색
    await searchInput.fill("존재하지않는이름");
    await expect(page.getByText("검색 결과가 없습니다")).toBeVisible();
  });

  test("필터 버튼이 표시되고 클릭할 수 있다", async ({ page }) => {
    await page.goto("/dashboard/friends");

    const filters = ["전체", "친구", "직장", "가족", "기타"];
    for (const filterName of filters) {
      const filterButton = page
        .locator("button")
        .filter({ hasText: new RegExp(`^${filterName}$`) });
      await expect(filterButton.first()).toBeVisible();
    }

    // 필터 클릭
    await page
      .locator("button")
      .filter({ hasText: /^친구$/ })
      .first()
      .click();
  });

  test("다른 관계 추천 버튼들이 모두 동작한다", async ({ page }) => {
    await page.goto("/dashboard/friends");
    await page.getByRole("button", { name: /추가/ }).click();

    const suggestions = ["친구", "직장 동료", "가족", "친척", "선후배", "지인"];
    const dialog = page.locator("[role='dialog']");

    for (const suggestion of suggestions) {
      await dialog.getByRole("button", { name: suggestion }).click();
      await expect(page.locator("#relation")).toHaveValue(suggestion);
    }
  });
});
