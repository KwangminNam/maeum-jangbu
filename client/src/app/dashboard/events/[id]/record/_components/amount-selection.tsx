"use client";

import { type ReactNode } from "react";
import { Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RECEIVED_AMOUNT_BADGES, GOLD_PRESETS } from "@/lib/constants";
import { AmountContext, useAmountContext, useAmount } from "../_hooks";

// ─── Root (Provider only) ───
interface AmountSelectionProps {
  children: ReactNode;
}

function AmountSelectionRoot({ children }: AmountSelectionProps) {
  const amount = useAmount();

  return (
    <AmountContext.Provider value={amount}>{children}</AmountContext.Provider>
  );
}

// ─── Card Wrapper ───
interface CardProps {
  children: ReactNode;
}

function AmountCard({ children }: CardProps) {
  return (
    <Card className="p-4 mb-4 border shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
          <Wallet size={16} className="text-primary-foreground" />
        </div>
        <Label className="text-sm font-semibold">금액 선택</Label>
      </div>
      {children}
    </Card>
  );
}

// ─── TypeToggle ───
function TypeToggle() {
  const { giftType, setGiftType } = useAmountContext();

  return (
    <div className="flex gap-2 mb-4">
      <button
        type="button"
        onClick={() => setGiftType("cash")}
        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
          giftType === "cash"
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
        }`}
      >
        💵 현금
      </button>
      <button
        type="button"
        onClick={() => setGiftType("gold")}
        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
          giftType === "gold"
            ? "bg-amber-500 text-white"
            : "bg-secondary text-secondary-foreground"
        }`}
      >
        🥇 금
      </button>
    </div>
  );
}

// ─── CashSelector ───
function CashSelector() {
  const { giftType, selectedAmount, customAmount, selectAmount, setCustomAmount } =
    useAmountContext();

  if (giftType !== "cash") return null;

  return (
    <>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {RECEIVED_AMOUNT_BADGES.map((badge) => (
          <button
            key={badge.value}
            type="button"
            className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              selectedAmount === badge.value
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
            onClick={() => selectAmount(badge.value)}
          >
            {badge.label}
          </button>
        ))}
      </div>
      <div className="relative">
        <Input
          placeholder="직접 입력"
          type="number"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          className="pr-10 h-11 rounded-xl"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          원
        </span>
      </div>
    </>
  );
}

// ─── GoldSelector ───
function GoldSelector() {
  const {
    giftType,
    goldDon,
    customGoldDon,
    goldPrice,
    goldAmount,
    goldDonAmount,
    selectGoldDon,
    setCustomGoldDon,
    setGoldPrice,
  } = useAmountContext();

  if (giftType !== "gold") return null;

  return (
    <>
      <div className="grid grid-cols-5 gap-2 mb-3">
        {GOLD_PRESETS.map((preset) => (
          <button
            key={preset.don}
            type="button"
            className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              goldDon === preset.don
                ? "bg-amber-500 text-white shadow-md"
                : "bg-secondary text-secondary-foreground hover:bg-amber-100"
            }`}
            onClick={() => selectGoldDon(preset.don)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="relative mb-3">
        <Input
          placeholder="직접 입력 (돈)"
          type="number"
          step="0.1"
          value={customGoldDon}
          onChange={(e) => setCustomGoldDon(e.target.value)}
          className="pr-10 h-11 rounded-xl"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          돈
        </span>
      </div>

      <div className="relative">
        <Input
          placeholder="1돈당 시세 입력"
          type="number"
          value={goldPrice ?? ""}
          onChange={(e) =>
            setGoldPrice(e.target.value ? Number(e.target.value) : null)
          }
          className="pr-16 h-11 rounded-xl"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          원/돈
        </span>
      </div>

      {goldPrice && goldDonAmount > 0 && (
        <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <div className="flex justify-between items-center">
            <span className="text-sm text-amber-700 dark:text-amber-300">
              {goldDonAmount}돈 × {goldPrice.toLocaleString()}원
            </span>
            <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
              ≈ {goldAmount.toLocaleString()}원
            </span>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Export Compound Component ───
export const AmountSelection = Object.assign(AmountSelectionRoot, {
  Card: AmountCard,
  TypeToggle,
  CashSelector,
  GoldSelector,
  useContext: useAmountContext,
});
