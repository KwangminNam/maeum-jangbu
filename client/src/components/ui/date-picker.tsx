"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
}

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MONTHS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

export function DatePicker({ value, onChange, placeholder = "날짜를 선택하세요" }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    if (value) {
      return new Date(value);
    }
    return new Date();
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value) : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (number | null)[] = [];

    // 이전 달의 빈 공간
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // 현재 달의 날짜들
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    onChange(`${year}-${month}-${dayStr}`);
    setIsOpen(false);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const formatDisplayDate = () => {
    if (!selectedDate) return placeholder;
    return `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`;
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div ref={containerRef} className="relative">
      {/* 트리거 버튼 */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-12 px-4 rounded-2xl border-2 transition-all flex items-center justify-between",
          "bg-white dark:bg-slate-900",
          isOpen
            ? "border-blue-400 dark:border-blue-500 shadow-lg shadow-blue-100 dark:shadow-blue-950/50"
            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600",
          !value && "text-muted-foreground"
        )}
      >
        <span className={cn("text-sm", value ? "font-medium" : "")}>
          {formatDisplayDate()}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Calendar size={18} className="text-muted-foreground" />
        </motion.div>
      </motion.button>

      {/* 캘린더 드롭다운 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute bottom-full left-0 right-0 mb-2 p-4 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePrevMonth}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft size={18} />
              </motion.button>
              <div className="font-semibold">
                {currentDate.getFullYear()}년 {MONTHS[currentDate.getMonth()]}
              </div>
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleNextMonth}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronRight size={18} />
              </motion.button>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map((day, index) => (
                <div
                  key={day}
                  className={cn(
                    "text-center text-xs font-medium py-2",
                    index === 0 ? "text-red-400" : index === 6 ? "text-blue-400" : "text-muted-foreground"
                  )}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 날짜 그리드 */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.01 },
                },
              }}
              className="grid grid-cols-7 gap-1"
            >
              {days.map((day, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    visible: { opacity: 1, scale: 1 },
                  }}
                >
                  {day ? (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleSelectDay(day)}
                      className={cn(
                        "w-full aspect-square rounded-xl text-sm font-medium transition-all",
                        isSelected(day)
                          ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/50"
                          : isToday(day)
                          ? "bg-slate-100 dark:bg-slate-800 ring-2 ring-blue-400 ring-offset-2 dark:ring-offset-slate-900"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800",
                        index % 7 === 0 && !isSelected(day) && "text-red-400",
                        index % 7 === 6 && !isSelected(day) && "text-blue-400"
                      )}
                    >
                      {day}
                    </motion.button>
                  ) : (
                    <div className="w-full aspect-square" />
                  )}
                </motion.div>
              ))}
            </motion.div>

            {/* 오늘 버튼 */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const today = new Date();
                setCurrentDate(today);
                handleSelectDay(today.getDate());
              }}
              className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 text-sm font-medium hover:from-slate-200 hover:to-slate-100 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all"
            >
              오늘
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
