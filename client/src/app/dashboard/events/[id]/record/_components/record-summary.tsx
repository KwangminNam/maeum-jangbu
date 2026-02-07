"use client";

import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";

interface RecordSummaryProps {
  totalPeople: number;
  amount: number;
}

export function RecordSummary({ totalPeople, amount }: RecordSummaryProps) {
  if (amount <= 0 || totalPeople <= 0) return null;

  return (
    <Card className="p-4 mb-4 border bg-accent">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Users size={14} className="text-primary-foreground" />
          </div>
          <span className="text-sm text-muted-foreground">
            {totalPeople}명 × {amount.toLocaleString()}원
          </span>
        </div>
        <div className="text-lg font-bold text-primary">
          {(amount * totalPeople).toLocaleString()}원
        </div>
      </div>
    </Card>
  );
}
