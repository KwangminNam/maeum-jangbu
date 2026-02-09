"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { itemVariants } from "@/lib/animations";
import type { ReactNode } from "react";

interface EventMessageCardProps {
  icon: ReactNode;
  message: string;
  subMessage?: string;
}

export function EventMessageCard({ icon, message, subMessage }: EventMessageCardProps) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="p-4 bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/30 dark:via-purple-950/30 dark:to-fuchsia-950/30 border-0 shadow-sm">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {icon}
          </motion.div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {message}
            </div>
            {subMessage && (
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {subMessage}
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
