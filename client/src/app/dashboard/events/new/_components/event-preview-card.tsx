"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EVENT_TYPES } from "@/lib/constants";

interface EventPreviewCardProps {
  title: string;
  type: string;
  date: string;
}

export function EventPreviewCard({ title, type, date }: EventPreviewCardProps) {
  const selectedType = EVENT_TYPES.find((t) => t.value === type);

  if (!title || !type || !date) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "p-5 rounded-3xl bg-gradient-to-br shadow-lg",
        selectedType?.gradient || "from-slate-100 to-gray-100"
      )}
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-white/80 dark:bg-slate-800/80 shadow-sm flex items-center justify-center">
          <span className="text-3xl">{selectedType?.emoji}</span>
        </div>
        <div className="flex-1">
          <div className="text-xs text-muted-foreground mb-1">미리보기</div>
          <div className="font-bold text-lg">{title}</div>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <span>{selectedType?.label}</span>
            <span>·</span>
            <span>
              {new Date(date).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
