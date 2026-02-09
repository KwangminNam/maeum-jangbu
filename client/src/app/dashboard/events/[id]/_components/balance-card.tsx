"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { itemVariants } from "@/lib/animations";

interface BalanceCardProps {
  receivedAmount: number;
  sentAmount: number;
}

export function BalanceCard({ receivedAmount, sentAmount }: BalanceCardProps) {
  const balance = receivedAmount - sentAmount;

  // 받은금액과 보낸금액이 같거나 둘 다 0일 때는 숨김
  if (receivedAmount === sentAmount || (receivedAmount === 0 && sentAmount === 0)) {
    return null;
  }

  const isPositive = balance >= 0;

  return (
    <motion.div variants={itemVariants}>
      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
        <Card
          className={`p-4 border-0 shadow-sm ${
            isPositive
              ? "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40"
              : "bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/40"
          }`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: isPositive ? [0, 10, 0] : [0, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {isPositive ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                    <span className="text-sm">😊</span>
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
                    <span className="text-sm">🥲</span>
                  </div>
                )}
              </motion.div>
              <div
                className={`text-sm font-medium ${
                  isPositive
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-rose-700 dark:text-rose-300"
                }`}
              >
                {isPositive ? "받은 금액이 더 많아요" : "보낸 금액이 더 많아요"}
              </div>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.4 }}
              className={`text-xl font-bold ${
                isPositive
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-rose-700 dark:text-rose-300"
              }`}
            >
              {isPositive ? "+" : ""}
              {balance.toLocaleString()}원
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
