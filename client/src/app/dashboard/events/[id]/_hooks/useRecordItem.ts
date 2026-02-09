"use client";

import { useReducer, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { revalidateEventDetail, revalidateDashboard } from "@/lib/actions";

// ─── State & Actions ───
interface RecordItemState {
  isEditing: boolean;
  amount: string;
  memo: string;
  isDeleting: boolean;
  isSaving: boolean;
}

type RecordItemAction =
  | { type: "START_EDITING" }
  | { type: "CANCEL_EDITING"; payload: { amount: string; memo: string } }
  | { type: "SET_AMOUNT"; payload: string }
  | { type: "SET_MEMO"; payload: string }
  | { type: "SET_DELETING"; payload: boolean }
  | { type: "SET_SAVING"; payload: boolean }
  | { type: "SAVE_SUCCESS" };

const recordItemReducer = (
  state: RecordItemState,
  action: RecordItemAction
): RecordItemState => {
  switch (action.type) {
    case "START_EDITING":
      return { ...state, isEditing: true };
    case "CANCEL_EDITING":
      return {
        ...state,
        isEditing: false,
        amount: action.payload.amount,
        memo: action.payload.memo,
      };
    case "SET_AMOUNT":
      return { ...state, amount: action.payload };
    case "SET_MEMO":
      return { ...state, memo: action.payload };
    case "SET_DELETING":
      return { ...state, isDeleting: action.payload };
    case "SET_SAVING":
      return { ...state, isSaving: action.payload };
    case "SAVE_SUCCESS":
      return { ...state, isEditing: false, isSaving: false };
    default:
      return action satisfies never;
  }
};

interface UseRecordItemParams {
  recordId: string;
  eventId: string;
  initialAmount: number;
  initialMemo: string | null;
  friendName: string;
}

export const useRecordItem = ({
  recordId,
  eventId,
  initialAmount,
  initialMemo,
  friendName,
}: UseRecordItemParams) => {
  const router = useRouter();

  const [state, dispatch] = useReducer(recordItemReducer, {
    isEditing: false,
    amount: initialAmount.toString(),
    memo: initialMemo || "",
    isDeleting: false,
    isSaving: false,
  });

  const startEditing = useCallback(() => {
    dispatch({ type: "START_EDITING" });
  }, []);

  const cancelEditing = useCallback(() => {
    dispatch({
      type: "CANCEL_EDITING",
      payload: {
        amount: initialAmount.toString(),
        memo: initialMemo || "",
      },
    });
  }, [initialAmount, initialMemo]);

  const setAmount = useCallback((value: string) => {
    dispatch({ type: "SET_AMOUNT", payload: value });
  }, []);

  const setMemo = useCallback((value: string) => {
    dispatch({ type: "SET_MEMO", payload: value });
  }, []);

  const handleSave = useCallback(async () => {
    dispatch({ type: "SET_SAVING", payload: true });

    try {
      await api.records.update(recordId, {
        amount: Number(state.amount),
        memo: state.memo || undefined,
      });
      await Promise.all([revalidateEventDetail(eventId), revalidateDashboard()]);
      dispatch({ type: "SAVE_SUCCESS" });
      toast.success("내역이 수정되었습니다");
      router.refresh();
    } catch {
      toast.error("수정에 실패했습니다");
      dispatch({ type: "SET_SAVING", payload: false });
    }
  }, [recordId, eventId, state.amount, state.memo, router]);

  const handleDelete = useCallback(async () => {
    dispatch({ type: "SET_DELETING", payload: true });

    try {
      await api.records.delete(recordId);
      await Promise.all([revalidateEventDetail(eventId), revalidateDashboard()]);
      toast.success(`${friendName}님의 내역이 삭제되었습니다`);
      router.refresh();
    } catch {
      toast.error("삭제에 실패했습니다");
      dispatch({ type: "SET_DELETING", payload: false });
    }
  }, [recordId, eventId, friendName, router]);

  return {
    ...state,
    startEditing,
    cancelEditing,
    setAmount,
    setMemo,
    handleSave,
    handleDelete,
  };
};
