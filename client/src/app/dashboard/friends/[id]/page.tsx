import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { createFetchClient } from "@/lib/fetch-client";
import { auth } from "@/lib/auth";
import { BackButton } from "@/components/back-button";
import type { FriendDetail } from "@/lib/api";

const TYPE_LABEL: Record<string, string> = {
  WEDDING: "결혼",
  FUNERAL: "장례",
  BIRTHDAY: "생일/잔치",
  ETC: "기타",
};

async function getFriend(id: string): Promise<FriendDetail | null> {
  const session = await auth();
  if (!session?.accessToken) return null;

  const serverClient = createFetchClient(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
  );
  serverClient.setAuthToken(session.accessToken);

  try {
    return await serverClient.get<FriendDetail>(`/friends/${id}`);
  } catch {
    return null;
  }
}

function FriendDetailSkeleton() {
  return (
    <div className="flex flex-col px-5 pt-14 pb-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-5 w-5 bg-muted rounded animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-24 bg-muted rounded animate-pulse" />
          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
        </div>
      </div>
      <Card className="p-4 mb-6 animate-pulse">
        <div className="h-16 bg-muted rounded" />
      </Card>
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-12 bg-muted rounded" />
          </Card>
        ))}
      </div>
    </div>
  );
}

async function FriendDetailContent({ id }: { id: string }) {
  const friend = await getFriend(id);

  if (!friend) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <p className="text-sm text-muted-foreground">지인을 찾을 수 없습니다</p>
      </div>
    );
  }

  const totalAmount = friend.records.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="flex flex-col px-5 pt-14 pb-4">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <BackButton />
        <div>
          <h1 className="text-xl font-bold">{friend.name}</h1>
          <p className="text-sm text-muted-foreground">{friend.relation}</p>
        </div>
      </div>

      {/* 요약 */}
      <Card className="p-4 mb-6">
        <div className="flex justify-around text-center">
          <div>
            <div className="text-xs text-muted-foreground mb-1">총 기록</div>
            <div className="font-bold text-base">{friend.records.length}건</div>
          </div>
          <Separator orientation="vertical" className="h-10" />
          <div>
            <div className="text-xs text-muted-foreground mb-1">총 금액</div>
            <div className="font-bold text-base">
              {totalAmount.toLocaleString()}원
            </div>
          </div>
        </div>
      </Card>

      {/* 타임라인 */}
      <h2 className="font-semibold mb-4">히스토리</h2>
      <div className="flex flex-col gap-3">
        {friend.records.map((record) => (
          <Card key={record.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {record.event.title}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {TYPE_LABEL[record.event.type] || record.event.type}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(record.event.date).toLocaleDateString("ko-KR")}
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

export default async function FriendDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<FriendDetailSkeleton />}>
      <FriendDetailContent id={id} />
    </Suspense>
  );
}
