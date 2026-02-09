"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // 에러 로깅 (추후 Sentry 등 연동 가능)
    console.error("Global Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 text-center shadow-lg">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center"
          >
            <AlertCircle className="w-8 h-8 text-red-500" />
          </motion.div>

          <h1 className="text-xl font-bold mb-2">문제가 발생했습니다</h1>
          <p className="text-sm text-muted-foreground mb-6">
            예상치 못한 오류가 발생했습니다.
            <br />
            잠시 후 다시 시도해주세요.
          </p>

          {process.env.NODE_ENV === "development" && (
            <div className="mb-6 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-left">
              <p className="text-xs font-mono text-red-500 break-all">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => (window.location.href = "/dashboard")}
            >
              <Home size={16} />
              홈으로
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
