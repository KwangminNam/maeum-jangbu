"use client";

import { useReducer, useCallback, useMemo, createContext, useContext } from "react";
import type { GiftType } from "@/lib/types";

// ─── State & Actions ───
interface AmountState {
  giftType: GiftType;
  selectedAmount: number | null;
  customAmount: string;
  goldDon: number | null;
  customGoldDon: string;
  goldPrice: number | null;
}

type AmountAction =
  | { type: "SET_GIFT_TYPE"; payload: GiftType }
  | { type: "SELECT_AMOUNT"; payload: number }
  | { type: "SET_CUSTOM_AMOUNT"; payload: string }
  | { type: "SELECT_GOLD_DON"; payload: number }
  | { type: "SET_CUSTOM_GOLD_DON"; payload: string }
  | { type: "SET_GOLD_PRICE"; payload: number | null };

const initialState: AmountState = {
  giftType: "cash",
  selectedAmount: null,
  customAmount: "",
  goldDon: null,
  customGoldDon: "",
  goldPrice: null,
};

const amountReducer = (state: AmountState, action: AmountAction): AmountState => {
  switch (action.type) {
    case "SET_GIFT_TYPE":
      return { ...state, giftType: action.payload };
    case "SELECT_AMOUNT":
      return { ...state, selectedAmount: action.payload, customAmount: "" };
    case "SET_CUSTOM_AMOUNT":
      return { ...state, customAmount: action.payload, selectedAmount: null };
    case "SELECT_GOLD_DON":
      return { ...state, goldDon: action.payload, customGoldDon: "" };
    case "SET_CUSTOM_GOLD_DON":
      return { ...state, customGoldDon: action.payload, goldDon: null };
    case "SET_GOLD_PRICE":
      return { ...state, goldPrice: action.payload };
    default:
      return action satisfies never;
  }
};

// ─── Context ───
interface AmountContextValue {
  giftType: GiftType;
  setGiftType: (type: GiftType) => void;
  selectedAmount: number | null;
  customAmount: string;
  selectAmount: (value: number) => void;
  setCustomAmount: (value: string) => void;
  goldDon: number | null;
  customGoldDon: string;
  goldPrice: number | null;
  goldDonAmount: number;
  goldAmount: number;
  selectGoldDon: (don: number) => void;
  setCustomGoldDon: (value: string) => void;
  setGoldPrice: (price: number | null) => void;
  amount: number;
}

export const AmountContext = createContext<AmountContextValue | null>(null);

export const useAmountContext = () => {
  const context = useContext(AmountContext);
  if (!context) {
    throw new Error("useAmountContext must be used within AmountProvider");
  }
  return context;
};

export const useAmount = () => {
  const [state, dispatch] = useReducer(amountReducer, initialState);

  const setGiftType = useCallback((type: GiftType) => {
    dispatch({ type: "SET_GIFT_TYPE", payload: type });
  }, []);

  const selectAmount = useCallback((value: number) => {
    dispatch({ type: "SELECT_AMOUNT", payload: value });
  }, []);

  const setCustomAmount = useCallback((value: string) => {
    dispatch({ type: "SET_CUSTOM_AMOUNT", payload: value });
  }, []);

  const selectGoldDon = useCallback((don: number) => {
    dispatch({ type: "SELECT_GOLD_DON", payload: don });
  }, []);

  const setCustomGoldDon = useCallback((value: string) => {
    dispatch({ type: "SET_CUSTOM_GOLD_DON", payload: value });
  }, []);

  const setGoldPrice = useCallback((price: number | null) => {
    dispatch({ type: "SET_GOLD_PRICE", payload: price });
  }, []);

  const cashAmount =
    state.selectedAmount ?? (state.customAmount ? Number(state.customAmount) : 0);

  const goldDonAmount = useMemo(
    () => (state.goldDon !== null ? state.goldDon : Number(state.customGoldDon) || 0),
    [state.goldDon, state.customGoldDon]
  );

  const goldAmount = useMemo(
    () => (state.goldPrice ? Math.round(goldDonAmount * state.goldPrice) : 0),
    [goldDonAmount, state.goldPrice]
  );

  const amount = state.giftType === "cash" ? cashAmount : goldAmount;

  return {
    giftType: state.giftType,
    setGiftType,
    selectedAmount: state.selectedAmount,
    customAmount: state.customAmount,
    selectAmount,
    setCustomAmount,
    goldDon: state.goldDon,
    customGoldDon: state.customGoldDon,
    goldPrice: state.goldPrice,
    goldDonAmount,
    goldAmount,
    selectGoldDon,
    setCustomGoldDon,
    setGoldPrice,
    amount,
  };
};
