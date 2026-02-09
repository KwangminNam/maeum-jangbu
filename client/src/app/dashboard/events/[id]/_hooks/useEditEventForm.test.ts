import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// Mock dependencies
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
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
    events: {
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/actions", () => ({
  revalidateEventDetail: vi.fn(),
  revalidateDashboard: vi.fn(),
}));

import { useEditEventForm } from "./useEditEventForm";

describe("useEditEventForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultParams = {
    eventId: "event-1",
    initialTitle: "테스트 이벤트",
    initialType: "WEDDING",
    initialDate: "2024-01-15T00:00:00.000Z",
  };

  describe("초기 상태", () => {
    it("기본값으로 초기화된다", () => {
      const { result } = renderHook(() => useEditEventForm(defaultParams));

      expect(result.current.isEditing).toBe(false);
      expect(result.current.title).toBe("테스트 이벤트");
      expect(result.current.type).toBe("WEDDING");
      expect(result.current.date).toBe("2024-01-15");
      expect(result.current.submitting).toBe(false);
      expect(result.current.isDeleting).toBe(false);
    });
  });

  describe("편집 모드", () => {
    it("startEditing으로 편집 모드로 전환된다", () => {
      const { result } = renderHook(() => useEditEventForm(defaultParams));

      act(() => {
        result.current.startEditing();
      });

      expect(result.current.isEditing).toBe(true);
    });

    it("cancelEditing으로 편집 모드가 취소되고 초기값으로 복원된다", () => {
      const { result } = renderHook(() => useEditEventForm(defaultParams));

      act(() => {
        result.current.startEditing();
        result.current.setTitle("변경된 제목");
        result.current.setType("FUNERAL");
      });

      expect(result.current.title).toBe("변경된 제목");
      expect(result.current.type).toBe("FUNERAL");

      act(() => {
        result.current.cancelEditing();
      });

      expect(result.current.isEditing).toBe(false);
      expect(result.current.title).toBe("테스트 이벤트");
      expect(result.current.type).toBe("WEDDING");
    });
  });

  describe("값 변경", () => {
    it("setTitle로 제목을 변경할 수 있다", () => {
      const { result } = renderHook(() => useEditEventForm(defaultParams));

      act(() => {
        result.current.setTitle("새로운 제목");
      });

      expect(result.current.title).toBe("새로운 제목");
    });

    it("setType으로 유형을 변경할 수 있다", () => {
      const { result } = renderHook(() => useEditEventForm(defaultParams));

      act(() => {
        result.current.setType("BIRTHDAY");
      });

      expect(result.current.type).toBe("BIRTHDAY");
    });

    it("setDate로 날짜를 변경할 수 있다", () => {
      const { result } = renderHook(() => useEditEventForm(defaultParams));

      act(() => {
        result.current.setDate("2024-12-25");
      });

      expect(result.current.date).toBe("2024-12-25");
    });
  });

  describe("유효성 검사", () => {
    it("제목, 유형, 날짜가 모두 있으면 isValid가 truthy", () => {
      const { result } = renderHook(() => useEditEventForm(defaultParams));

      expect(result.current.isValid).toBeTruthy();
    });

    it("제목이 없으면 isValid가 falsy", () => {
      const { result } = renderHook(() => useEditEventForm(defaultParams));

      act(() => {
        result.current.setTitle("");
      });

      expect(result.current.isValid).toBeFalsy();
    });
  });

  describe("제출", () => {
    it("handleSubmit 호출 시 submitting이 true가 된다", async () => {
      const { api } = await import("@/lib/api");
      vi.mocked(api.events.update).mockResolvedValue(undefined);

      const { result } = renderHook(() => useEditEventForm(defaultParams));

      const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

      act(() => {
        result.current.handleSubmit(mockEvent);
      });

      expect(result.current.submitting).toBe(true);

      await waitFor(() => {
        expect(result.current.submitting).toBe(false);
      });
    });
  });

  describe("삭제", () => {
    it("handleDelete 호출 시 isDeleting이 true가 된다", async () => {
      const { api } = await import("@/lib/api");
      vi.mocked(api.events.delete).mockResolvedValue(undefined);

      const { result } = renderHook(() => useEditEventForm(defaultParams));

      act(() => {
        result.current.handleDelete();
      });

      expect(result.current.isDeleting).toBe(true);
    });
  });
});
