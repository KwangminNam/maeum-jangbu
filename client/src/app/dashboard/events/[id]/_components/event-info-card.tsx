"use client";

import { Pencil, Trash2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EVENT_TYPE_LABELS } from "@/lib/constants";
import { itemVariants } from "@/lib/animations";

const TYPE_EMOJI: Record<string, string> = {
  WEDDING: "💒",
  FUNERAL: "🕯️",
  BIRTHDAY: "🎂",
  ETC: "🎉",
};

interface EventInfoCardProps {
  type: string;
  date: string;
  title: string;
  recordCount: number;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function EventInfoCard({
  type,
  date,
  title,
  recordCount,
  isDeleting,
  onEdit,
  onDelete,
}: EventInfoCardProps) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
              <span className="text-lg">{TYPE_EMOJI[type] || "🎉"}</span>
            </div>
            <div>
              <div className="text-sm font-medium">
                {new Date(date).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="text-xs text-muted-foreground">{recordCount}명 참여</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="rounded-full px-3">
              {EVENT_TYPE_LABELS[type] || type}
            </Badge>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onEdit}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <Pencil size={14} className="text-muted-foreground" />
            </motion.button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 size={14} className="animate-spin text-red-500" />
                  ) : (
                    <Trash2 size={14} className="text-red-500" />
                  )}
                </motion.button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>경조사 삭제</AlertDialogTitle>
                  <AlertDialogDescription>
                    &quot;{title}&quot;을(를) 삭제하시겠습니까?
                    {recordCount > 0 && (
                      <span className="block mt-2 text-red-500 font-medium">
                        모든 내역({recordCount}건)이 함께 삭제됩니다.
                      </span>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">취소</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="rounded-xl bg-red-500 hover:bg-red-600"
                  >
                    삭제
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
