"use client";

import { useReducer, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { revalidateEventDetail, revalidateDashboard } from "@/lib/actions";

// ─── State & Actions ───
interface EditEventFormState {
  isEditing: boolean;
  title: string;
  type: string;
  date: string;
  submitting: boolean;
  isDeleting: boolean;
}

type EditEventFormAction =
  | { type: "START_EDITING" }
  | { type: "CANCEL_EDITING"; payload: { title: string; type: string; date: string } }
  | { type: "SET_TITLE"; payload: string }
  | { type: "SET_TYPE"; payload: string }
  | { type: "SET_DATE"; payload: string }
  | { type: "SET_SUBMITTING"; payload: boolean }
  | { type: "SET_DELETING"; payload: boolean }
  | { type: "SUBMIT_SUCCESS" };

const editEventFormReducer = (
  state: EditEventFormState,
  action: EditEventFormAction
): EditEventFormState => {
  switch (action.type) {
    case "START_EDITING":
      return { ...state, isEditing: true };
    case "CANCEL_EDITING":
      return {
        ...state,
        isEditing: false,
        title: action.payload.title,
        type: action.payload.type,
        date: action.payload.date,
      };
    case "SET_TITLE":
      return { ...state, title: action.payload };
    case "SET_TYPE":
      return { ...state, type: action.payload };
    case "SET_DATE":
      return { ...state, date: action.payload };
    case "SET_SUBMITTING":
      return { ...state, submitting: action.payload };
    case "SET_DELETING":
      return { ...state, isDeleting: action.payload };
    case "SUBMIT_SUCCESS":
      return { ...state, isEditing: false, submitting: false };
    default:
      return action satisfies never;
  }
};

const formatDateForInput = (isoDate: string) => {
  return new Date(isoDate).toISOString().split("T")[0];
};

interface UseEditEventFormParams {
  eventId: string;
  initialTitle: string;
  initialType: string;
  initialDate: string;
}

export const useEditEventForm = ({
  eventId,
  initialTitle,
  initialType,
  initialDate,
}: UseEditEventFormParams) => {
  const router = useRouter();
  const formattedInitialDate = formatDateForInput(initialDate);

  const [state, dispatch] = useReducer(editEventFormReducer, {
    isEditing: false,
    title: initialTitle,
    type: initialType,
    date: formattedInitialDate,
    submitting: false,
    isDeleting: false,
  });

  const startEditing = useCallback(() => {
    dispatch({ type: "START_EDITING" });
  }, []);

  const cancelEditing = useCallback(() => {
    dispatch({
      type: "CANCEL_EDITING",
      payload: {
        title: initialTitle,
        type: initialType,
        date: formattedInitialDate,
      },
    });
  }, [initialTitle, initialType, formattedInitialDate]);

  const setTitle = useCallback((value: string) => {
    dispatch({ type: "SET_TITLE", payload: value });
  }, []);

  const setType = useCallback((value: string) => {
    dispatch({ type: "SET_TYPE", payload: value });
  }, []);

  const setDate = useCallback((value: string) => {
    dispatch({ type: "SET_DATE", payload: value });
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      dispatch({ type: "SET_SUBMITTING", payload: true });

      try {
        await api.events.update(eventId, {
          title: state.title,
          type: state.type,
          date: state.date,
        });
        await Promise.all([revalidateEventDetail(eventId), revalidateDashboard()]);
        dispatch({ type: "SUBMIT_SUCCESS" });
        toast.success("수정되었습니다");
        router.refresh();
      } catch {
        toast.error("수정에 실패했습니다");
        dispatch({ type: "SET_SUBMITTING", payload: false });
      }
    },
    [eventId, state.title, state.type, state.date, router]
  );

  const handleDelete = useCallback(async () => {
    dispatch({ type: "SET_DELETING", payload: true });

    try {
      await api.events.delete(eventId);
      await revalidateDashboard();
      toast.success("경조사가 삭제되었습니다");
      router.push("/dashboard");
    } catch {
      toast.error("삭제에 실패했습니다");
      dispatch({ type: "SET_DELETING", payload: false });
    }
  }, [eventId, router]);

  const isValid = state.title && state.type && state.date;

  return {
    ...state,
    isValid,
    startEditing,
    cancelEditing,
    setTitle,
    setType,
    setDate,
    handleSubmit,
    handleDelete,
  };
};
