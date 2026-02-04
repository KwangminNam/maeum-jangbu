import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Suspense } from "@/components/ui/suspense";
import { createFetchClient } from "@/lib/fetch-client";
import { auth } from "@/lib/auth";
import { BackButton } from "@/components/back-button";
import { EditEventForm } from "./edit-event-form";
import { RecordList } from "./record-list";
import type { EventDetail } from "@/lib/api";


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

function EventContentSkeleton() {
  return (
    <>
      {/* 대시보드 스켈레톤 */}
      <div className="flex flex-col gap-3 mb-6">
        <Card className="p-4 animate-pulse">
          <div className="h-10 bg-muted rounded" />
        </Card>
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 animate-pulse">
            <div className="h-14 bg-muted rounded" />
          </Card>
          <Card className="p-4 animate-pulse">
            <div className="h-14 bg-muted rounded" />
          </Card>
        </div>
        <Card className="p-4 animate-pulse">
          <div className="h-8 bg-muted rounded" />
        </Card>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="h-5 w-20 bg-muted rounded animate-pulse" />
        <div className="h-8 w-24 bg-muted rounded animate-pulse" />
      </div>
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-3 animate-pulse">
            <div className="h-12 bg-muted rounded" />
          </Card>
        ))}
      </div>
    </>
  );
}

async function EventTitle({ id }: { id: string }) {
  const event = await getEvent(id);
  return <h1 className="text-xl font-bold">{event?.title ?? "이벤트"}</h1>;
}

async function EventContent({ id }: { id: string }) {
  const event = await getEvent(id);

  if (!event) {
    return (
      <p className="text-sm text-muted-foreground text-center py-10">
        이벤트를 찾을 수 없습니다
      </p>
    );
  }

  const receivedAmount = event.records.reduce((sum, r) => sum + r.amount, 0);

  return (
    <>
      {/* 대시보드 + 수정 폼 (토글) */}
      <EditEventForm
        eventId={event.id}
        initialTitle={event.title}
        initialType={event.type}
        initialDate={event.date}
        receivedAmount={receivedAmount}
        sentAmount={event.sentTotalAmount}
        recordCount={event.records.length}
      />

      {/* 기록 추가 버튼 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">내역 목록</h2>
        <Button size="sm" variant="outline" asChild>
          <Link href={`/dashboard/events/${event.id}/record`}>
            <Plus size={14} className="mr-1" />
            기록 추가
          </Link>
        </Button>
      </div>

      {/* 내역 리스트 (수정/삭제 가능) */}
      <RecordList records={event.records} eventId={event.id} />
    </>
  );
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex flex-col px-5 pt-14 pb-4">
      {/* 헤더 - BackButton 즉시 표시 */}
      <div className="flex items-center gap-3 mb-4">
        <BackButton />
        <Suspense.Skeleton skeleton={<div className="h-6 w-32 bg-muted rounded animate-pulse" />}>
          <EventTitle id={id} />
        </Suspense.Skeleton>
      </div>

      {/* 콘텐츠 */}
      <Suspense.Skeleton skeleton={<EventContentSkeleton />}>
        <EventContent id={id} />
      </Suspense.Skeleton>
    </div>
  );
}
