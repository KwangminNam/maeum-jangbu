import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "마음장부 - 경조사 내역 관리";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          backgroundImage:
            "radial-gradient(circle at 25px 25px, #f0f0f0 2%, transparent 0%), radial-gradient(circle at 75px 75px, #f0f0f0 2%, transparent 0%)",
          backgroundSize: "100px 100px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffff",
            padding: "60px 80px",
            borderRadius: "24px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 700,
              color: "#171717",
              marginBottom: 24,
            }}
          >
            📔 마음장부
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#525252",
              textAlign: "center",
            }}
          >
            경조사 내역 관리 및 AI 적정 금액 제안 서비스
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
