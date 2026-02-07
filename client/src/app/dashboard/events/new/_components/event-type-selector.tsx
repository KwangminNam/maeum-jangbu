"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EVENT_TYPES } from "@/lib/constants";

interface EventTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function EventTypeSelector({ value, onChange }: EventTypeSelectorProps) {
  const selectedType = EVENT_TYPES.find((t) => t.value === value);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">어떤 경조사인가요?</span>
        {selectedType && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-lg"
          >
            {selectedType.emoji}
          </motion.span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {EVENT_TYPES.map((eventType, index) => (
          <motion.button
            key={eventType.value}
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(eventType.value)}
            className={cn(
              "relative p-4 rounded-2xl border-2 transition-all overflow-hidden",
              value === eventType.value
                ? `bg-gradient-to-br ${eventType.gradient} border-transparent ${eventType.ring} ring-2 ring-offset-2 dark:ring-offset-slate-900`
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
            )}
          >
            {value === eventType.value && (
              <motion.div
                layoutId="selectedType"
                className={`absolute inset-0 bg-gradient-to-br ${eventType.gradient} opacity-50`}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <div className="relative flex flex-col items-start gap-1">
              <span className="text-2xl">{eventType.emoji}</span>
              <span className="font-semibold text-sm">{eventType.label}</span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                {eventType.description}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
