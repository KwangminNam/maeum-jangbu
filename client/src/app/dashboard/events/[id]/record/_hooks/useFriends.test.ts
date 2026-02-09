import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFriends } from "./useFriends";

describe("useFriends", () => {
  describe("초기 상태", () => {
    it("기본값으로 초기화된다", () => {
      const { result } = renderHook(() => useFriends());

      expect(result.current.selectedFriendIds).toEqual([]);
      expect(result.current.newFriends).toEqual([]);
      expect(result.current.newName).toBe("");
      expect(result.current.newRelation).toBe("");
      expect(result.current.hasPendingNewFriend).toBe(false);
      expect(result.current.totalPeople).toBe(0);
    });
  });

  describe("기존 지인 토글", () => {
    it("지인을 선택하면 selectedFriendIds에 추가된다", () => {
      const { result } = renderHook(() => useFriends());

      act(() => {
        result.current.toggleFriend("friend-1");
      });

      expect(result.current.selectedFriendIds).toContain("friend-1");
      expect(result.current.totalPeople).toBe(1);
    });

    it("선택된 지인을 다시 토글하면 제거된다", () => {
      const { result } = renderHook(() => useFriends());

      act(() => {
        result.current.toggleFriend("friend-1");
      });

      act(() => {
        result.current.toggleFriend("friend-1");
      });

      expect(result.current.selectedFriendIds).not.toContain("friend-1");
      expect(result.current.totalPeople).toBe(0);
    });

    it("여러 지인을 선택할 수 있다", () => {
      const { result } = renderHook(() => useFriends());

      act(() => {
        result.current.toggleFriend("friend-1");
        result.current.toggleFriend("friend-2");
        result.current.toggleFriend("friend-3");
      });

      expect(result.current.selectedFriendIds).toHaveLength(3);
      expect(result.current.totalPeople).toBe(3);
    });
  });

  describe("새 지인 입력", () => {
    it("이름과 관계를 입력할 수 있다", () => {
      const { result } = renderHook(() => useFriends());

      act(() => {
        result.current.setNewName("홍길동");
        result.current.setNewRelation("친구");
      });

      expect(result.current.newName).toBe("홍길동");
      expect(result.current.newRelation).toBe("친구");
    });

    it("이름과 관계가 모두 입력되면 hasPendingNewFriend가 true가 된다", () => {
      const { result } = renderHook(() => useFriends());

      act(() => {
        result.current.setNewName("홍길동");
      });

      expect(result.current.hasPendingNewFriend).toBe(false);

      act(() => {
        result.current.setNewRelation("친구");
      });

      expect(result.current.hasPendingNewFriend).toBe(true);
    });

    it("pendingNewFriend도 totalPeople에 포함된다", () => {
      const { result } = renderHook(() => useFriends());

      act(() => {
        result.current.setNewName("홍길동");
        result.current.setNewRelation("친구");
      });

      expect(result.current.totalPeople).toBe(1);
    });
  });

  describe("새 지인 추가", () => {
    it("addNewFriend로 새 지인을 추가할 수 있다", () => {
      const { result } = renderHook(() => useFriends());

      act(() => {
        result.current.setNewName("홍길동");
        result.current.setNewRelation("친구");
      });

      act(() => {
        result.current.addNewFriend();
      });

      expect(result.current.newFriends).toHaveLength(1);
      expect(result.current.newFriends[0]).toEqual({
        name: "홍길동",
        relation: "친구",
      });
      expect(result.current.newName).toBe("");
      expect(result.current.newRelation).toBe("");
    });

    it("이름이 없으면 추가되지 않는다", () => {
      const { result } = renderHook(() => useFriends());

      act(() => {
        result.current.setNewRelation("친구");
      });

      act(() => {
        result.current.addNewFriend();
      });

      expect(result.current.newFriends).toHaveLength(0);
    });

    it("관계가 없으면 추가되지 않는다", () => {
      const { result } = renderHook(() => useFriends());

      act(() => {
        result.current.setNewName("홍길동");
      });

      act(() => {
        result.current.addNewFriend();
      });

      expect(result.current.newFriends).toHaveLength(0);
    });

    it("공백만 있는 경우 추가되지 않는다", () => {
      const { result } = renderHook(() => useFriends());

      act(() => {
        result.current.setNewName("   ");
        result.current.setNewRelation("   ");
      });

      act(() => {
        result.current.addNewFriend();
      });

      expect(result.current.newFriends).toHaveLength(0);
    });

    it("입력값의 공백이 trim된다", () => {
      const { result } = renderHook(() => useFriends());

      act(() => {
        result.current.setNewName("  홍길동  ");
        result.current.setNewRelation("  친구  ");
      });

      act(() => {
        result.current.addNewFriend();
      });

      expect(result.current.newFriends[0]).toEqual({
        name: "홍길동",
        relation: "친구",
      });
    });
  });

  describe("새 지인 삭제", () => {
    it("removeNewFriend로 새 지인을 삭제할 수 있다", () => {
      const { result } = renderHook(() => useFriends());

      act(() => {
        result.current.setNewName("홍길동");
        result.current.setNewRelation("친구");
        result.current.addNewFriend();
      });

      act(() => {
        result.current.setNewName("김철수");
        result.current.setNewRelation("직장동료");
        result.current.addNewFriend();
      });

      expect(result.current.newFriends).toHaveLength(2);

      act(() => {
        result.current.removeNewFriend(0);
      });

      expect(result.current.newFriends).toHaveLength(1);
      expect(result.current.newFriends[0].name).toBe("김철수");
    });
  });

  describe("getAllNewFriends", () => {
    it("추가된 지인과 pending 지인을 모두 반환한다", () => {
      const { result } = renderHook(() => useFriends());

      act(() => {
        result.current.setNewName("홍길동");
        result.current.setNewRelation("친구");
        result.current.addNewFriend();
      });

      act(() => {
        result.current.setNewName("김철수");
        result.current.setNewRelation("직장동료");
      });

      const allFriends = result.current.getAllNewFriends();

      expect(allFriends).toHaveLength(2);
      expect(allFriends[0]).toEqual({ name: "홍길동", relation: "친구" });
      expect(allFriends[1]).toEqual({ name: "김철수", relation: "직장동료" });
    });

    it("pending 지인이 없으면 추가된 지인만 반환한다", () => {
      const { result } = renderHook(() => useFriends());

      act(() => {
        result.current.setNewName("홍길동");
        result.current.setNewRelation("친구");
        result.current.addNewFriend();
      });

      const allFriends = result.current.getAllNewFriends();

      expect(allFriends).toHaveLength(1);
    });
  });

  describe("totalPeople 계산", () => {
    it("선택된 기존 지인 + 추가된 새 지인 + pending 새 지인의 합계", () => {
      const { result } = renderHook(() => useFriends());

      // 기존 지인 2명 선택
      act(() => {
        result.current.toggleFriend("friend-1");
        result.current.toggleFriend("friend-2");
      });

      // 새 지인 1명 추가
      act(() => {
        result.current.setNewName("홍길동");
        result.current.setNewRelation("친구");
        result.current.addNewFriend();
      });

      // pending 새 지인 1명
      act(() => {
        result.current.setNewName("김철수");
        result.current.setNewRelation("직장동료");
      });

      expect(result.current.totalPeople).toBe(4);
    });
  });
});
