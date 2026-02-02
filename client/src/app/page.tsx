"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("http://localhost:3001");
      const text = await res.text();
      setMessage(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "요청 실패");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-bold">마음장부 - 서버 연결 테스트</h1>
      <button
        onClick={handleClick}
        className="rounded-lg bg-black px-6 py-3 text-white hover:bg-zinc-800"
      >
        서버에 GET 요청 보내기
      </button>
      {message && (
        <p className="text-lg text-green-600">서버 응답: {message}</p>
      )}
      {error && (
        <p className="text-lg text-red-600">에러: {error}</p>
      )}
    </div>
  );
}
