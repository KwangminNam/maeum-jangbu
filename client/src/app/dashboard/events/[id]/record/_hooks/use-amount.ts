"use client";

import { useState, useCallback, useMemo, createContext, useContext } from "react";
import type { GiftType } from "@/lib/types";

interface AmountContextValue {
  // Gift type
  giftType: GiftType;
  setGiftType: (type: GiftType) => void;
  // Cash
  selectedAmount: number | null;
  customAmount: string;
  selectAmount: (value: number) => void;
  setCustomAmount: (value: string) => void;
  // Gold
  goldDon: number | null;
  customGoldDon: string;
  goldPrice: number | null;
  goldDonAmount: number;
  goldAmount: number;
  selectGoldDon: (don: number) => void;
  setCustomGoldDon: (value: string) => void;
  setGoldPrice: (price: number | null) => void;
  // Computed
  amount: number;
}

export const AmountContext = createContext<AmountContextValue | null>(null);

export function useAmountContext() {
  const context = useContext(AmountContext);
  if (!context) {
    throw new Error("useAmountContext must be used within AmountProvider");
  }
  return context;
}

export function useAmount() {
  const [giftType, setGiftType] = useState<GiftType>("cash");

  // Cash state
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmountState] = useState("");

  // Gold state
  const [goldDon, setGoldDon] = useState<number | null>(null);
  const [customGoldDon, setCustomGoldDonState] = useState("");
  const [goldPrice, setGoldPriceState] = useState<number | null>(null);

  // Cash handlers
  const selectAmount = useCallback((value: number) => {
    setSelectedAmount(value);
    setCustomAmountState("");
  }, []);

  const setCustomAmount = useCallback((value: string) => {
    setCustomAmountState(value);
    setSelectedAmount(null);
  }, []);

  // Gold handlers
  const selectGoldDon = useCallback((don: number) => {
    setGoldDon(don);
    setCustomGoldDonState("");
  }, []);

  const setCustomGoldDon = useCallback((value: string) => {
    setCustomGoldDonState(value);
    setGoldDon(null);
  }, []);

  const setGoldPrice = useCallback((price: number | null) => {
    setGoldPriceState(price);
  }, []);

  // Computed values
  const cashAmount = selectedAmount ?? (customAmount ? Number(customAmount) : 0);

  const goldDonAmount = useMemo(
    () => (goldDon !== null ? goldDon : Number(customGoldDon) || 0),
    [goldDon, customGoldDon]
  );

  const goldAmount = useMemo(
    () => (goldPrice ? Math.round(goldDonAmount * goldPrice) : 0),
    [goldDonAmount, goldPrice]
  );

  const amount = giftType === "cash" ? cashAmount : goldAmount;

  return {
    giftType,
    setGiftType,
    selectedAmount,
    customAmount,
    selectAmount,
    setCustomAmount,
    goldDon,
    customGoldDon,
    goldPrice,
    goldDonAmount,
    goldAmount,
    selectGoldDon,
    setCustomGoldDon,
    setGoldPrice,
    amount,
  };
}
