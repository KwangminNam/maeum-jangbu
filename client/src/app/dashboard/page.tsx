import { Suspense } from "react";
import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createFetchClient } from "@/lib/fetch-client";
import { auth } from "@/lib/auth";
import type { Event } from "@/lib/api";

const TYPE_LABEL: Record<string, string> = {
  WEDDING: "결혼",
  FUNERAL: "장례",
  BIRTHDAY: "생일/잔치",
  ETC: "기타",
};

async function getEvents(): Promise<Event[]> {
  const session = await auth();
  if (!session?.accessToken) return [];

  const serverClient = createFetchClient(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
  );
  serverClient.setAuthToken(session.accessToken);

  try {
    return await serverClient.get<Event[]>("/events");
  } catch {
    return [];
  }
}

function EventListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <div className="h-5 w-32 bg-muted rounded" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
            <div className="h-5 w-20 bg-muted rounded" />
          </div>
        </Card>
      ))}
    </div>
  );
}

async function EventList() {
  const events = await getEvents();

  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-10">
        등록된 이벤트가 없습니다
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {events.map((event) => {
        const totalAmount = event.records.reduce((sum, r) => sum + r.amount, 0);
        return (
          <Link key={event.id} href={`/dashboard/events/${event.id}`}>
            <Card className="p-4 hover:bg-accent/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{event.title}</span>
                    <Badge variant="secondary" className="text-xs">
                      {TYPE_LABEL[event.type] || event.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>
                      {new Date(event.date).toLocaleDateString("ko-KR")}
                    </span>
                    <span>{event.records.length}명</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    {totalAmount.toLocaleString()}원
                  </span>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col px-5 pt-14 pb-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">경조사 내역</h1>
          <p className="text-sm text-muted-foreground mt-0.5">이벤트 목록</p>
        </div>
        <Button size="sm" asChild>
          <Link href="/dashboard/events/new">
            <Plus size={16} className="mr-1" />새 이벤트
          </Link>
        </Button>
      </div>

      {/* 이벤트 목록 */}
      <Suspense fallback={<EventListSkeleton />}>
        <EventList />
      </Suspense>
    </div>
  );
}
