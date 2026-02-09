import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "마음장부",
    short_name: "마음장부",
    description: "경조사 내역 관리 및 AI 적정 금액 제안 서비스",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
  };
}
