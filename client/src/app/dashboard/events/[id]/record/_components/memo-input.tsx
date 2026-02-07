"use client";

import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MemoInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function MemoInput({ value, onChange }: MemoInputProps) {
  return (
    <Card className="p-4 mb-4 border shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-toss-yellow flex items-center justify-center">
          <FileText size={16} className="text-white" />
        </div>
        <Label htmlFor="memo" className="text-sm font-semibold">
          메모 <span className="text-muted-foreground font-normal">(선택)</span>
        </Label>
      </div>
      <Input
        id="memo"
        placeholder="메모를 입력하세요"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-xl"
      />
    </Card>
  );
}
