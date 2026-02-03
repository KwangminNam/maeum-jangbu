import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { createFetchClient } from "@/lib/fetch-client";
import { auth } from "@/lib/auth";
import { BackButton } from "@/components/back-button";
import type { EventDetail } from "@/lib/api";

const TYPE_LABEL: Record<string, string> = {
  WEDDING: "결혼",
  FUNERAL: "장례",
  BIRTHDAY: "생일/잔치",
  ETC: "기타",
};

async function getEvent(id: string): Promise<EventDetail | null> {
  const session = await auth();
  if (!session?.accessToken) return null;

  const serverClient = createFetchClient(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
  );
  serverClient.setAuthToken(session.accessToken);

  try {
    return await serverClient.get<EventDetail>(`/events/${id}`);
  } catch {
    return null;
  }
}

function EventDetailSkeleton() {
  return (
    <div className="flex flex-col px-5 pt-14 pb-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-5 w-5 bg-muted rounded animate-pulse" />
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
      </div>
      <Card className="p-4 mb-6 animate-pulse">
        <div className="h-20 bg-muted rounded" />
      </Card>
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-3 animate-pulse">
            <div className="h-12 bg-muted rounded" />
          </Card>
        ))}
      </div>
    </div>
  );
}

async function EventDetailContent({ id }: { id: string }) {
  const event = await getEvent(id);

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <p className="text-sm text-muted-foreground">이벤트를 찾을 수 없습니다</p>
      </div>
    );
  }

  const totalAmount = event.records.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="flex flex-col px-5 pt-14 pb-4">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-4">
        <BackButton />
        <h1 className="text-xl font-bold">{event.title}</h1>
      </div>

      {/* 요약 카드 */}
      <Card className="p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {new Date(event.date).toLocaleDateString("ko-KR")}
          </div>
          <Badge variant="secondary">
            {TYPE_LABEL[event.type] || event.type}
          </Badge>
        </div>
        <Separator className="my-3" />
        <div className="flex justify-between items-end">
          <div>
            <div className="text-sm text-muted-foreground">총 금액</div>
            <div className="text-2xl font-bold">
              {totalAmount.toLocaleString()}원
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {event.records.length}명
          </div>
        </div>
      </Card>

      {/* 기록 추가 버튼 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">내역 목록</h2>
        <Button size="sm" variant="outline" asChild>
          <Link href={`/dashboard/events/${id}/record`}>
            <Plus size={14} className="mr-1" />
            기록 추가
          </Link>
        </Button>
      </div>

      {/* 내역 리스트 */}
      <div className="flex flex-col gap-2">
        {event.records.map((record) => (
          <Card key={record.id} className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{record.friend.name}</div>
                <div className="text-xs text-muted-foreground">
                  {record.friend.relation}
                </div>
              </div>
              <div className="font-semibold text-sm">
                {record.amount.toLocaleString()}원
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<EventDetailSkeleton />}>
      <EventDetailContent id={id} />
    </Suspense>
  );
}
