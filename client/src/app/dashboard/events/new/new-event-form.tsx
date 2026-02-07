"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { BackButton } from "@/components/back-button";
import { BottomCTA } from "@/components/bottom-cta";
import { api } from "@/lib/api";
import { revalidateDashboard } from "@/lib/actions";
import { containerVariants, itemVariants } from "@/lib/animations";
import { EventTypeSelector, OcrBanner, EventPreviewCard } from "./_components";

export function NewEventForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [date, setDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSubmitting(true);
    try {
      await api.events.create({ title, type, date });
      await revalidateDashboard();
      toast.success("이벤트가 등록되었습니다!");
      router.push("/dashboard");
    } catch {
      toast.error("이벤트 등록에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = title && type && date;

  return (
    <div className="relative flex flex-col h-full pb-32 overflow-y-auto bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800"
      >
        <div className="flex items-center gap-3 px-5 py-4">
          <BackButton />
          <div className="flex-1">
            <h1 className="text-lg font-bold">새 이벤트</h1>
            <p className="text-xs text-muted-foreground">경조사 내역을 기록해보세요</p>
          </div>
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          >
            <Sparkles className="text-amber-400" size={24} />
          </motion.div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="flex-1 px-5 py-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-8"
        >
          {/* OCR 스캔 배너 */}
          <motion.div variants={itemVariants}>
            <OcrBanner />
          </motion.div>

          {/* 이벤트 유형 선택 */}
          <motion.div variants={itemVariants}>
            <EventTypeSelector value={type} onChange={setType} />
          </motion.div>

          {/* 이벤트 이름 */}
          <motion.div variants={itemVariants} className="flex flex-col gap-3">
            <label htmlFor="title" className="text-sm font-semibold">
              이벤트 이름을 지어주세요
            </label>
            <div className="relative">
              <Input
                id="title"
                placeholder="예: 나의 결혼식, 아버지 칠순"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-12 px-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-0 transition-all text-base"
              />
              {title && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M13.5 4.5L6.5 11.5L3 8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* 날짜 선택 */}
          <motion.div variants={itemVariants} className="flex flex-col gap-3">
            <label className="text-sm font-semibold">언제 있었나요?</label>
            <DatePicker
              value={date}
              onChange={setDate}
              placeholder="날짜를 선택하세요"
            />
          </motion.div>

          {/* 미리보기 카드 */}
          {isValid && <EventPreviewCard title={title} type={type} date={date} />}
        </motion.div>
      </form>

      {/* 하단 버튼 */}
      <BottomCTA
        onClick={handleSubmit}
        disabled={!isValid}
        loading={submitting}
        loadingText="등록 중..."
      >
        <span>이벤트 등록하기</span>
        <ArrowRight size={18} />
      </BottomCTA>
    </div>
  );
}
