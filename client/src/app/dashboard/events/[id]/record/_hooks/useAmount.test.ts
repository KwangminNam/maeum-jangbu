import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAmount } from "./useAmount";

describe("useAmount", () => {
  describe("초기 상태", () => {
    it("기본값으로 초기화된다", () => {
      const { result } = renderHook(() => useAmount());

      expect(result.current.giftType).toBe("cash");
      expect(result.current.selectedAmount).toBeNull();
      expect(result.current.customAmount).toBe("");
      expect(result.current.goldDon).toBeNull();
      expect(result.current.customGoldDon).toBe("");
      expect(result.current.goldPrice).toBeNull();
      expect(result.current.amount).toBe(0);
    });
  });

  describe("현금 금액 선택", () => {
    it("금액 뱃지를 선택하면 selectedAmount가 설정된다", () => {
      const { result } = renderHook(() => useAmount());

      act(() => {
        result.current.selectAmount(50000);
      });

      expect(result.current.selectedAmount).toBe(50000);
      expect(result.current.amount).toBe(50000);
    });

    it("금액을 선택하면 customAmount가 초기화된다", () => {
      const { result } = renderHook(() => useAmount());

      act(() => {
        result.current.setCustomAmount("30000");
      });

      expect(result.current.customAmount).toBe("30000");

      act(() => {
        result.current.selectAmount(50000);
      });

      expect(result.current.selectedAmount).toBe(50000);
      expect(result.current.customAmount).toBe("");
    });

    it("직접 입력하면 selectedAmount가 null이 된다", () => {
      const { result } = renderHook(() => useAmount());

      act(() => {
        result.current.selectAmount(50000);
      });

      act(() => {
        result.current.setCustomAmount("100000");
      });

      expect(result.current.selectedAmount).toBeNull();
      expect(result.current.customAmount).toBe("100000");
      expect(result.current.amount).toBe(100000);
    });
  });

  describe("금 선택", () => {
    it("giftType을 gold로 변경할 수 있다", () => {
      const { result } = renderHook(() => useAmount());

      act(() => {
        result.current.setGiftType("gold");
      });

      expect(result.current.giftType).toBe("gold");
    });

    it("금 돈수를 선택하면 goldDon이 설정된다", () => {
      const { result } = renderHook(() => useAmount());

      act(() => {
        result.current.selectGoldDon(3);
      });

      expect(result.current.goldDon).toBe(3);
      expect(result.current.goldDonAmount).toBe(3);
    });

    it("금 돈수를 선택하면 customGoldDon이 초기화된다", () => {
      const { result } = renderHook(() => useAmount());

      act(() => {
        result.current.setCustomGoldDon("5");
      });

      expect(result.current.customGoldDon).toBe("5");

      act(() => {
        result.current.selectGoldDon(3);
      });

      expect(result.current.goldDon).toBe(3);
      expect(result.current.customGoldDon).toBe("");
    });

    it("금 시세가 설정되면 goldAmount가 계산된다", () => {
      const { result } = renderHook(() => useAmount());

      act(() => {
        result.current.setGiftType("gold");
        result.current.selectGoldDon(3);
        result.current.setGoldPrice(500000);
      });

      expect(result.current.goldDonAmount).toBe(3);
      expect(result.current.goldAmount).toBe(1500000); // 3돈 * 50만원
      expect(result.current.amount).toBe(1500000);
    });

    it("금 시세가 없으면 goldAmount는 0이다", () => {
      const { result } = renderHook(() => useAmount());

      act(() => {
        result.current.setGiftType("gold");
        result.current.selectGoldDon(3);
      });

      expect(result.current.goldAmount).toBe(0);
      expect(result.current.amount).toBe(0);
    });
  });

  describe("giftType에 따른 amount 계산", () => {
    it("cash 타입일 때 현금 금액이 반환된다", () => {
      const { result } = renderHook(() => useAmount());

      act(() => {
        result.current.selectAmount(100000);
        result.current.selectGoldDon(3);
        result.current.setGoldPrice(500000);
      });

      expect(result.current.giftType).toBe("cash");
      expect(result.current.amount).toBe(100000);
    });

    it("gold 타입일 때 금 금액이 반환된다", () => {
      const { result } = renderHook(() => useAmount());

      act(() => {
        result.current.selectAmount(100000);
        result.current.setGiftType("gold");
        result.current.selectGoldDon(3);
        result.current.setGoldPrice(500000);
      });

      expect(result.current.giftType).toBe("gold");
      expect(result.current.amount).toBe(1500000);
    });
  });
});
