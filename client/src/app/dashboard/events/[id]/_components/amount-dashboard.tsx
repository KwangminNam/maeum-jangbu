"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { itemVariants, numberVariants } from "@/lib/animations";

interface AmountDashboardProps {
  receivedAmount: number;
  sentAmount: number;
}

export function AmountDashboard({ receivedAmount, sentAmount }: AmountDashboardProps) {
  return (
    <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
      {/* 받은 금액 */}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40 border-0 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 dark:bg-blue-400/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2 flex items-center gap-1">
              <TrendingDown size={12} />
              받은 금액
            </div>
            <motion.div
              variants={numberVariants}
              className="text-2xl font-bold text-blue-700 dark:text-blue-300"
            >
              {receivedAmount.toLocaleString()}
              <span className="text-base ml-0.5">원</span>
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* 보낸 금액 */}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Card className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40 border-0 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200/30 dark:bg-orange-400/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-2 flex items-center gap-1">
              <TrendingUp size={12} />
              보낸 금액
            </div>
            <motion.div
              variants={numberVariants}
              className="text-2xl font-bold text-orange-700 dark:text-orange-300"
            >
              {sentAmount.toLocaleString()}
              <span className="text-base ml-0.5">원</span>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
