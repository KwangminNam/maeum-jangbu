"use client";

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EventEditFormActionsProps {
  isValid: boolean;
  submitting: boolean;
  onCancel: () => void;
}

export function EventEditFormActions({
  isValid,
  submitting,
  onCancel,
}: EventEditFormActionsProps) {
  return (
    <div className="flex gap-3 mt-3">
      <Button
        type="button"
        variant="outline"
        className="flex-1 h-11 rounded-xl"
        onClick={onCancel}
        disabled={submitting}
      >
        취소
      </Button>
      <motion.button
        type="submit"
        whileHover={!submitting && isValid ? { scale: 1.02 } : {}}
        whileTap={!submitting && isValid ? { scale: 0.98 } : {}}
        className={cn(
          "flex-1 h-11 rounded-xl font-medium flex items-center justify-center transition-all",
          !isValid || submitting
            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/50"
        )}
        disabled={!isValid || submitting}
      >
        {submitting ? <Loader2 size={18} className="animate-spin" /> : "저장"}
      </motion.button>
    </div>
  );
}
