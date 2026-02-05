"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X, Heart, Flower2, Cake, Sparkles, Trash2, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";
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
import { api } from "@/lib/api";
import { revalidateEventDetail, revalidateDashboard } from "@/lib/actions";

const EVENT_TYPES = [
  { value: "WEDDING", label: "결혼식", emoji: "💒", gradient: "from-pink-100 to-rose-100 dark:from-pink-950/40 dark:to-rose-950/40", ring: "ring-pink-400" },
  { value: "FUNERAL", label: "장례식", emoji: "🕯️", gradient: "from-purple-100 to-violet-100 dark:from-purple-950/40 dark:to-violet-950/40", ring: "ring-purple-400" },
  { value: "BIRTHDAY", label: "생일/잔치", emoji: "🎂", gradient: "from-amber-100 to-yellow-100 dark:from-amber-950/40 dark:to-yellow-950/40", ring: "ring-amber-400" },
  { value: "ETC", label: "기타", emoji: "🎉", gradient: "from-slate-100 to-gray-100 dark:from-slate-900/40 dark:to-gray-900/40", ring: "ring-slate-400" },
];

const TYPE_LABEL: Record<string, string> = {
  WEDDING: "결혼",
  FUNERAL: "장례",
  BIRTHDAY: "생일/잔치",
  ETC: "기타",
};

// 다음 기념일까지 남은 일수 계산 (매년 반복되는 이벤트용)
function getDaysUntilNextAnniversary(eventDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const event = new Date(eventDate);
  const thisYearAnniversary = new Date(today.getFullYear(), event.getMonth(), event.getDate());

  if (thisYearAnniversary < today) {
    thisYearAnniversary.setFullYear(today.getFullYear() + 1);
  }

  const diffTime = thisYearAnniversary.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// 이벤트로부터 경과한 년수 계산
function getYearsSinceEvent(eventDate: string): number {
  const today = new Date();
  const event = new Date(eventDate);
  let years = today.getFullYear() - event.getFullYear();

  const thisYearAnniversary = new Date(today.getFullYear(), event.getMonth(), event.getDate());
  if (today < thisYearAnniversary) {
    years -= 1;
  }

  return Math.max(0, years);
}

// 이벤트 타입별 특별 메시지 생성
function getEventMessage(type: string, eventDate: string): { icon: React.ReactNode; message: string; subMessage?: string } | null {
  const daysUntil = getDaysUntilNextAnniversary(eventDate);
  const yearsSince = getYearsSinceEvent(eventDate);

  switch (type) {
    case "WEDDING": {
      const icon = <Heart className="text-pink-500" size={20} />;
      if (daysUntil === 0) {
        return {
          icon,
          message: "오늘은 결혼기념일이에요!",
          subMessage: yearsSince > 0 ? `벌써 ${yearsSince}주년, 축하드려요!` : "첫 번째 결혼기념일을 축하해요!",
        };
      }
      if (daysUntil <= 30) {
        return {
          icon,
          message: `결혼기념일까지 D-${daysUntil}`,
          subMessage: yearsSince > 0 ? `곧 ${yearsSince + 1}주년이 되네요!` : "곧 첫 번째 기념일이에요!",
        };
      }
      return {
        icon,
        message: "행복한 결혼 생활 되세요",
        subMessage: yearsSince > 0 ? `${yearsSince}주년을 함께 해주셔서 감사해요` : undefined,
      };
    }

    case "FUNERAL": {
      const icon = <Flower2 className="text-purple-400" size={20} />;
      if (daysUntil === 0) {
        return {
          icon,
          message: "오늘은 기일이에요",
          subMessage: "하늘에서 평안히 쉬고 계실 거예요",
        };
      }
      if (daysUntil <= 14) {
        return {
          icon,
          message: `기일까지 D-${daysUntil}`,
          subMessage: "소중한 분을 기억하며...",
        };
      }
      return {
        icon,
        message: "하늘에서 편히 쉬고 계실 거예요",
        subMessage: "마음 속에 늘 함께 해요",
      };
    }

    case "BIRTHDAY": {
      const icon = <Cake className="text-yellow-500" size={20} />;
      if (daysUntil === 0) {
        return {
          icon,
          message: "오늘이 바로 그 날이에요!",
          subMessage: "생일 축하드려요!",
        };
      }
      if (daysUntil <= 30) {
        return {
          icon,
          message: `생일까지 D-${daysUntil}`,
          subMessage: "특별한 하루가 될 거예요!",
        };
      }
      return {
        icon,
        message: "좋은 추억이 되셨길 바라요",
        subMessage: "함께해 주셔서 감사해요",
      };
    }

    case "ETC":
    default: {
      const icon = <Sparkles className="text-amber-500" size={20} />;
      return {
        icon,
        message: "소중한 순간을 기록했어요",
        subMessage: "함께해 주신 분들께 감사드려요",
      };
    }
  }
}

// 애니메이션 variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

const numberVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 15,
      delay: 0.2,
    },
  },
};

interface EditEventFormProps {
  eventId: string;
  initialTitle: string;
  initialType: string;
  initialDate: string;
  receivedAmount: number;
  sentAmount: number;
  recordCount: number;
}

export function EditEventForm({
  eventId,
  initialTitle,
  initialType,
  initialDate,
  receivedAmount,
  sentAmount,
  recordCount,
}: EditEventFormProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const formatDateForInput = (isoDate: string) => {
    return new Date(isoDate).toISOString().split("T")[0];
  };

  const [title, setTitle] = useState(initialTitle);
  const [type, setType] = useState(initialType);
  const [date, setDate] = useState(formatDateForInput(initialDate));
  const [submitting, setSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.events.delete(eventId);
      await revalidateDashboard();
      toast.success("경조사가 삭제되었습니다");
      router.push("/dashboard");
    } catch {
      toast.error("삭제에 실패했습니다");
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setTitle(initialTitle);
    setType(initialType);
    setDate(formatDateForInput(initialDate));
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.events.update(eventId, { title, type, date });
      await Promise.all([
        revalidateEventDetail(eventId),
        revalidateDashboard(),
      ]);
      setIsEditing(false);
      toast.success("수정되었습니다");
      router.refresh();
    } catch {
      toast.error("수정에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  const balance = receivedAmount - sentAmount;
  const eventMessage = getEventMessage(initialType, initialDate);

  return (
    <AnimatePresence mode="wait">
      {isEditing ? (
        <motion.div
          key="edit"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="p-5 mb-6 shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-lg">이벤트 수정</h3>
              <Button variant="ghost" size="icon" onClick={handleCancel} className="h-8 w-8 rounded-full">
                <X size={18} />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-title" className="text-sm font-medium">이벤트 이름</Label>
                <Input
                  id="edit-title"
                  placeholder="예: 나의 결혼식"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-11 rounded-xl border-2 focus:border-blue-400"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">이벤트 유형</Label>
                <div className="grid grid-cols-2 gap-2">
                  {EVENT_TYPES.map((eventType) => (
                    <motion.button
                      key={eventType.value}
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setType(eventType.value)}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all flex items-center gap-2",
                        type === eventType.value
                          ? `bg-gradient-to-br ${eventType.gradient} border-transparent ${eventType.ring} ring-2 ring-offset-1`
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                      )}
                    >
                      <span className="text-lg">{eventType.emoji}</span>
                      <span className="font-medium text-sm">{eventType.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">날짜</Label>
                <DatePicker
                  value={date}
                  onChange={setDate}
                  placeholder="날짜를 선택하세요"
                />
              </div>

              <div className="flex gap-3 mt-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11 rounded-xl"
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  취소
                </Button>
                <motion.button
                  type="submit"
                  whileHover={!submitting && title && type && date ? { scale: 1.02 } : {}}
                  whileTap={!submitting && title && type && date ? { scale: 0.98 } : {}}
                  className={cn(
                    "flex-1 h-11 rounded-xl font-medium flex items-center justify-center transition-all",
                    !title || !type || !date || submitting
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/50"
                  )}
                  disabled={!title || !type || !date || submitting}
                >
                  {submitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    "저장"
                  )}
                </motion.button>
              </div>
            </form>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          key="view"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-3 mb-6"
        >
          {/* 이벤트 정보 카드 */}
          <motion.div variants={itemVariants}>
            <Card className="p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                    <span className="text-lg">
                      {initialType === "WEDDING" && "💒"}
                      {initialType === "FUNERAL" && "🕯️"}
                      {initialType === "BIRTHDAY" && "🎂"}
                      {initialType === "ETC" && "🎉"}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      {new Date(initialDate).toLocaleDateString("ko-KR", {
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
                    {TYPE_LABEL[initialType] || initialType}
                  </Badge>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsEditing(true)}
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
                          &quot;{initialTitle}&quot;을(를) 삭제하시겠습니까?
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
            </Card>
          </motion.div>

          {/* 이벤트 타입별 특별 메시지 */}
          {eventMessage && (
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
                    {eventMessage.icon}
                  </motion.div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {eventMessage.message}
                    </div>
                    {eventMessage.subMessage && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {eventMessage.subMessage}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* 금액 대시보드 */}
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

          {/* 정산 결과 - 받은금액과 보낸금액이 같거나 둘 다 0일 때는 숨김 */}
          {receivedAmount !== sentAmount && (receivedAmount > 0 || sentAmount > 0) && (
            <motion.div variants={itemVariants}>
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Card className={`p-4 border-0 shadow-sm ${
                  balance >= 0
                    ? "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40"
                    : "bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/40"
                }`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: balance >= 0 ? [0, 10, 0] : [0, -10, 0] }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        {balance >= 0 ? (
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                            <span className="text-sm">😊</span>
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
                            <span className="text-sm">🥲</span>
                          </div>
                        )}
                      </motion.div>
                      <div className={`text-sm font-medium ${
                        balance >= 0
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-rose-700 dark:text-rose-300"
                      }`}>
                        {balance >= 0 ? "받은 금액이 더 많아요" : "보낸 금액이 더 많아요"}
                      </div>
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.4 }}
                      className={`text-xl font-bold ${
                        balance >= 0
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-rose-700 dark:text-rose-300"
                      }`}
                    >
                      {balance >= 0 ? "+" : ""}{balance.toLocaleString()}원
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
