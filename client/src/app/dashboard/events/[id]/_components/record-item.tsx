"use client";

import { Trash2, Pencil, X, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { useRecordItem } from "../_hooks/useRecordItem";

interface RecordItemProps {
  record: {
    id: string;
    amount: number;
    memo: string | null;
    friend: { id: string; name: string; relation: string };
  };
  eventId: string;
}

export function RecordItem({ record, eventId }: RecordItemProps) {
  const {
    isEditing,
    amount,
    memo,
    isDeleting,
    isSaving,
    startEditing,
    cancelEditing,
    setAmount,
    setMemo,
    handleSave,
    handleDelete,
  } = useRecordItem({
    recordId: record.id,
    eventId,
    initialAmount: record.amount,
    initialMemo: record.memo,
    friendName: record.friend.name,
  });

  // 수정 모드
  if (isEditing) {
    return (
      <motion.div layout>
        <Card
          className={`p-4 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 shadow-md ${isSaving ? "opacity-60" : ""}`}
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {record.friend.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-sm">{record.friend.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {record.friend.relation}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                {isSaving ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                ) : (
                  <>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={cancelEditing}
                      className="p-2 rounded-full hover:bg-white/50 transition-colors"
                    >
                      <X size={16} />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handleSave}
                      disabled={!amount}
                      className="p-2 rounded-full hover:bg-white/50 transition-colors text-blue-600"
                    >
                      <Check size={16} />
                    </motion.button>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="금액"
                className="flex-1 h-10 rounded-xl bg-white/70 dark:bg-slate-900/50"
                disabled={isSaving}
              />
              <Input
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="메모 (선택)"
                className="flex-1 h-10 rounded-xl bg-white/70 dark:bg-slate-900/50"
                disabled={isSaving}
              />
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // 삭제 중 상태
  if (isDeleting) {
    return (
      <motion.div
        layout
        initial={{ opacity: 1 }}
        animate={{ opacity: 0.5, scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="p-4 shadow-sm">
          <div className="flex items-center justify-center gap-2 py-1">
            <Loader2 size={18} className="animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">삭제 중...</span>
          </div>
        </Card>
      </motion.div>
    );
  }

  // 기본 뷰 모드
  return (
    <motion.div layout whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
      <Card className="p-4 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {record.friend.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{record.friend.name}</span>
                {record.memo && (
                  <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                    {record.memo}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {record.friend.relation}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="font-bold text-sm">
              {record.amount.toLocaleString()}
              <span className="text-xs font-normal ml-0.5">원</span>
            </div>
            <div className="flex gap-0.5">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={startEditing}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <Pencil size={14} className="text-muted-foreground" />
              </motion.button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </motion.button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>내역 삭제</AlertDialogTitle>
                    <AlertDialogDescription>
                      {record.friend.name}님의 {record.amount.toLocaleString()}원 내역을
                      삭제하시겠습니까?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">취소</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="rounded-xl bg-red-500 hover:bg-red-600"
                    >
                      삭제
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
