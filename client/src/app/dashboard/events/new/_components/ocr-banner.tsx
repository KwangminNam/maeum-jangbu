"use client";

import Link from "next/link";
import { Scan, ArrowRight } from "lucide-react";

interface OcrBannerProps {
  href?: string;
}

export function OcrBanner({ href = "/dashboard/events/new/ocr" }: OcrBannerProps) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40 border border-blue-100 dark:border-blue-900 hover:shadow-md transition-shadow cursor-pointer">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <Scan className="text-white" size={24} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-blue-900 dark:text-blue-100">
            명부 스캔으로 빠르게 등록
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            사진 한 장으로 여러 명 한번에 입력
          </p>
        </div>
        <ArrowRight className="text-blue-400" size={20} />
      </div>
    </Link>
  );
}
