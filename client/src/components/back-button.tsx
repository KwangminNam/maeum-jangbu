"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();

  return (
    <button onClick={() => router.back()} aria-label="뒤로 가기">
      <ArrowLeft size={20} />
    </button>
  );
}
