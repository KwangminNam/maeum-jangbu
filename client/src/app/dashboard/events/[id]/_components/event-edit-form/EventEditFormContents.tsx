"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";
import { EVENT_TYPES } from "@/lib/constants";

interface EventEditFormContentsProps {
  title: string;
  type: string;
  date: string;
  onTitleChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onDateChange: (value: string) => void;
}

export function EventEditFormContents({
  title,
  type,
  date,
  onTitleChange,
  onTypeChange,
  onDateChange,
}: EventEditFormContentsProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* 이벤트 이름 */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="edit-title" className="text-sm font-medium">
          이벤트 이름
        </Label>
        <Input
          id="edit-title"
          placeholder="예: 나의 결혼식"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="h-11 rounded-xl border-2 focus:border-blue-400"
        />
      </div>

      {/* 이벤트 유형 */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">이벤트 유형</Label>
        <div className="grid grid-cols-2 gap-2">
          {EVENT_TYPES.map((eventType) => (
            <motion.button
              key={eventType.value}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => onTypeChange(eventType.value)}
              className={cn(
                "p-3 rounded-xl border-2 transition-all flex items-center gap-2",
                type === eventType.value
                  ? `bg-gradient-to-br ${eventType.gradient} border-transparent ${eventType.ring} ring-2 ring-offset-1`
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300"
              )}
            >
              <span className="text-lg">{eventType.emoji}</span>
              <span className="font-medium text-sm">{eventType.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 날짜 */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">날짜</Label>
        <DatePicker
          value={date}
          onChange={onDateChange}
          placeholder="날짜를 선택하세요"
        />
      </div>
    </div>
  );
}
