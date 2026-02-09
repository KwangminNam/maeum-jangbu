"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  const router = useRouter();

  useEffect(() => {
    console.error("Dashboard Error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Card className="p-6 text-center shadow-lg">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"
          >
            <AlertCircle className="w-7 h-7 text-amber-500" />
          </motion.div>

          <h2 className="text-lg font-bold mb-2">오류가 발생했습니다</h2>
          <p className="text-sm text-muted-foreground mb-5">
            데이터를 불러오는 중 문제가 발생했습니다.
          </p>

          {process.env.NODE_ENV === "development" && (
            <div className="mb-5 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-left">
              <p className="text-xs font-mono text-red-500 break-all">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => router.back()}
            >
              <ArrowLeft size={16} />
              뒤로가기
            </Button>
            <Button className="flex-1 gap-2" onClick={reset}>
              <RefreshCw size={16} />
              다시 시도
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
