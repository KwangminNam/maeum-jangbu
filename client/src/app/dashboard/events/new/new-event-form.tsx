"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BackButton } from "@/components/back-button";
import { api } from "@/lib/api";

const EVENT_TYPES = [
  { value: "WEDDING", label: "결혼식" },
  { value: "FUNERAL", label: "장례식" },
  { value: "BIRTHDAY", label: "생일/잔치" },
  { value: "ETC", label: "기타" },
];

export function NewEventForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [date, setDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.events.create({ title, type, date });
      router.push("/dashboard");
    } catch {
      alert("이벤트 등록에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col px-5 pt-14 pb-4">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-8">
        <BackButton />
        <h1 className="text-xl font-bold">새 이벤트 등록</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">이벤트 이름</Label>
          <Input
            id="title"
            placeholder="예: 나의 결혼식, 아버지 칠순"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>이벤트 유형</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="유형을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="date">날짜</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12 mt-4 text-base"
          disabled={!title || !type || !date || submitting}
        >
          {submitting ? "등록 중..." : "등록하기"}
        </Button>
      </form>
    </div>
  );
}
