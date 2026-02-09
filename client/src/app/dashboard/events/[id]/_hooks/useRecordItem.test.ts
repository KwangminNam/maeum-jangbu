import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// Mock dependencies
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/api", () => ({
  api: {
    records: {
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/actions", () => ({
  revalidateEventDetail: vi.fn(),
  revalidateDashboard: vi.fn(),
}));

import { useRecordItem } from "./useRecordItem";

describe("useRecordItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultParams = {
    recordId: "record-1",
    eventId: "event-1",
    initialAmount: 100000,
    initialMemo: "테스트 메모",
    friendName: "홍길동",
  };

  describe("초기 상태", () => {
    it("기본값으로 초기화된다", () => {
      const { result } = renderHook(() => useRecordItem(defaultParams));

      expect(result.current.isEditing).toBe(false);
      expect(result.current.amount).toBe("100000");
      expect(result.current.memo).toBe("테스트 메모");
      expect(result.current.isDeleting).toBe(false);
      expect(result.current.isSaving).toBe(false);
    });

    it("메모가 null이면 빈 문자열로 초기화된다", () => {
      const { result } = renderHook(() =>
        useRecordItem({ ...defaultParams, initialMemo: null })
      );

      expect(result.current.memo).toBe("");
    });
  });

  describe("편집 모드", () => {
    it("startEditing으로 편집 모드로 전환된다", () => {
      const { result } = renderHook(() => useRecordItem(defaultParams));

      act(() => {
        result.current.startEditing();
      });

      expect(result.current.isEditing).toBe(true);
    });

    it("cancelEditing으로 편집 모드가 취소되고 초기값으로 복원된다", () => {
      const { result } = renderHook(() => useRecordItem(defaultParams));

      act(() => {
        result.current.startEditing();
        result.current.setAmount("200000");
        result.current.setMemo("변경된 메모");
      });

      expect(result.current.amount).toBe("200000");
      expect(result.current.memo).toBe("변경된 메모");

      act(() => {
        result.current.cancelEditing();
      });

      expect(result.current.isEditing).toBe(false);
      expect(result.current.amount).toBe("100000");
      expect(result.current.memo).toBe("테스트 메모");
    });
  });

  describe("값 변경", () => {
    it("setAmount로 금액을 변경할 수 있다", () => {
      const { result } = renderHook(() => useRecordItem(defaultParams));

      act(() => {
        result.current.setAmount("150000");
      });

      expect(result.current.amount).toBe("150000");
    });

    it("setMemo로 메모를 변경할 수 있다", () => {
      const { result } = renderHook(() => useRecordItem(defaultParams));

      act(() => {
        result.current.setMemo("새로운 메모");
      });

      expect(result.current.memo).toBe("새로운 메모");
    });
  });

  describe("저장", () => {
    it("handleSave 호출 시 isSaving이 true가 된다", async () => {
      const { api } = await import("@/lib/api");
      vi.mocked(api.records.update).mockResolvedValue(undefined);

      const { result } = renderHook(() => useRecordItem(defaultParams));

      act(() => {
        result.current.handleSave();
      });

      expect(result.current.isSaving).toBe(true);

      await waitFor(() => {
        expect(result.current.isSaving).toBe(false);
      });
    });

    it("저장 성공 시 isEditing이 false가 된다", async () => {
      const { api } = await import("@/lib/api");
      vi.mocked(api.records.update).mockResolvedValue(undefined);

      const { result } = renderHook(() => useRecordItem(defaultParams));

      act(() => {
        result.current.startEditing();
      });

      expect(result.current.isEditing).toBe(true);

      act(() => {
        result.current.handleSave();
      });

      await waitFor(() => {
        expect(result.current.isEditing).toBe(false);
      });
    });
  });

  describe("삭제", () => {
    it("handleDelete 호출 시 isDeleting이 true가 된다", async () => {
      const { api } = await import("@/lib/api");
      vi.mocked(api.records.delete).mockResolvedValue(undefined);

      const { result } = renderHook(() => useRecordItem(defaultParams));

      act(() => {
        result.current.handleDelete();
      });

      expect(result.current.isDeleting).toBe(true);
    });
  });
});
