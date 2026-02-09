"use client";

import { ErrorBoundary as ReactErrorBoundary, type FallbackProps } from "react-error-boundary";
import { AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./button";
import { Card } from "./card";
import type { ReactNode } from "react";

function DefaultErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4"
    >
      <Card className="p-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              오류가 발생했습니다
            </p>
            {process.env.NODE_ENV === "development" && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400 break-all">
                {errorMessage}
              </p>
            )}
            <Button
              size="sm"
              variant="outline"
              className="mt-3 gap-1.5 h-8 text-xs"
              onClick={resetErrorBoundary}
            >
              <RefreshCw size={12} />
              다시 시도
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function CompactErrorFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex items-center justify-center p-4">
      <Button
        size="sm"
        variant="ghost"
        className="gap-2 text-muted-foreground"
        onClick={resetErrorBoundary}
      >
        <AlertCircle size={14} />
        오류 발생 - 다시 시도
      </Button>
    </div>
  );
}

// ─── Compound Component ───
interface ErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
  onError?: (error: unknown, info: { componentStack?: string | null }) => void;
}

function ErrorBoundaryRoot({ children, onReset, onError }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={DefaultErrorFallback}
      onReset={onReset}
      onError={onError}
    >
      {children}
    </ReactErrorBoundary>
  );
}

function ErrorBoundaryCompact({ children, onReset, onError }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={CompactErrorFallback}
      onReset={onReset}
      onError={onError}
    >
      {children}
    </ReactErrorBoundary>
  );
}

interface CustomErrorBoundaryProps extends ErrorBoundaryProps {
  fallback: ReactNode;
}

function ErrorBoundaryCustom({ children, fallback, onReset, onError }: CustomErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      fallback={fallback}
      onReset={onReset}
      onError={onError}
    >
      {children}
    </ReactErrorBoundary>
  );
}

export const ErrorBoundary = Object.assign(ErrorBoundaryRoot, {
  Compact: ErrorBoundaryCompact,
  Custom: ErrorBoundaryCustom,
});
