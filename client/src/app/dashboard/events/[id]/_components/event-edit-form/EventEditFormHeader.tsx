"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventEditFormHeaderProps {
  onCancel: () => void;
}

export function EventEditFormHeader({ onCancel }: EventEditFormHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h3 className="font-semibold text-lg">이벤트 수정</h3>
      <Button
        variant="ghost"
        size="icon"
        onClick={onCancel}
        className="h-8 w-8 rounded-full"
      >
        <X size={18} />
      </Button>
    </div>
  );
}
