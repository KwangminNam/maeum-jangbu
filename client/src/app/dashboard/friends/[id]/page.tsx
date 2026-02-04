import { Card } from "@/components/ui/card";
import { Suspense } from "@/components/ui/suspense";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { createFetchClient } from "@/lib/fetch-client";
import { auth } from "@/lib/auth";
import { BackButton } from "@/components/back-button";
import { SentRecordForm } from "./sent-record-form";
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

function FriendContentSkeleton() {
  return (
    <>
      <Card className="p-4 mb-6 animate-pulse">
        <div className="h-16 bg-muted rounded" />
      </Card>
      <div className="h-5 w-20 bg-muted rounded animate-pulse mb-3" />
      <div className="flex flex-col gap-2 mb-6">
        {[1, 2].map((i) => (
          <Card key={i} className="p-3 animate-pulse">
            <div className="h-12 bg-muted rounded" />
          </Card>
        ))}
      </div>
      <div className="h-5 w-20 bg-muted rounded animate-pulse mb-3" />
      <div className="flex flex-col gap-2">
        {[1, 2].map((i) => (
          <Card key={i} className="p-3 animate-pulse">
            <div className="h-12 bg-muted rounded" />
          </Card>
        ))}
      </div>
    </>
  );
}

async function FriendHeader({ id }: { id: string }) {
  const friend = await getFriend(id);
  return (
    <div>
      <h1 className="text-xl font-bold">{friend?.name ?? "지인"}</h1>
      <p className="text-sm text-muted-foreground">{friend?.relation ?? ""}</p>
    </div>
  );
}

async function FriendContent({ id }: { id: string }) {
  const friend = await getFriend(id);

  if (!friend) {
    return (
      <p className="text-sm text-muted-foreground text-center py-10">
        지인을 찾을 수 없습니다
      </p>
    );
  }

  const receivedTotal = friend.records.reduce((sum, r) => sum + r.amount, 0);
  const sentTotal = friend.sentRecords?.reduce((sum, r) => sum + r.amount, 0) ?? 0;
  const balance = receivedTotal - sentTotal;

  return (
    <>
      {/* 요약 */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xs text-muted-foreground mb-1">받은 금액</div>
            <div className="font-bold text-sm text-blue-600">
              +{receivedTotal.toLocaleString()}원
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">보낸 금액</div>
            <div className="font-bold text-sm text-red-600">
              -{sentTotal.toLocaleString()}원
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">잔액</div>
            <div className={`font-bold text-sm ${balance >= 0 ? "text-green-600" : "text-orange-600"}`}>
              {balance >= 0 ? "+" : ""}{balance.toLocaleString()}원
            </div>
          </div>
        </div>
      </Card>

      {/* 받은 기록 */}
      <h2 className="font-semibold mb-3">받은 기록</h2>
      <div className="flex flex-col gap-2 mb-6">
        {friend.records.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            받은 기록이 없습니다
          </p>
        ) : (
          friend.records.map((record) => (
            <Card key={record.id} className="p-3">
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
                <div className="font-semibold text-sm text-blue-600">
                  +{record.amount.toLocaleString()}원
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* 보낸 기록 */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">보낸 기록</h2>
        <SentRecordForm friendId={id} friendName={friend.name} />
      </div>
      <div className="flex flex-col gap-2">
        {(!friend.sentRecords || friend.sentRecords.length === 0) ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            보낸 기록이 없습니다
          </p>
        ) : (
          friend.sentRecords.map((record) => (
            <Card key={record.id} className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="outline" className="text-xs">
                    {TYPE_LABEL[record.eventType] || record.eventType}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(record.date).toLocaleDateString("ko-KR")}
                  </div>
                  {record.memo && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {record.memo}
                    </div>
                  )}
                </div>
                <div className="font-semibold text-sm text-red-600">
                  -{record.amount.toLocaleString()}원
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </>
  );
}

export default async function FriendDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex flex-col px-5 pt-14 pb-4 h-full overflow-y-auto">
      {/* 헤더 - BackButton 즉시 표시 */}
      <div className="flex items-center gap-3 mb-6">
        <BackButton />
        <Suspense.Skeleton
          skeleton={
            <div className="space-y-2">
              <div className="h-6 w-24 bg-muted rounded animate-pulse" />
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
            </div>
          }
        >
          <FriendHeader id={id} />
        </Suspense.Skeleton>
      </div>

      {/* 콘텐츠 */}
      <Suspense.Skeleton skeleton={<FriendContentSkeleton />}>
        <FriendContent id={id} />
      </Suspense.Skeleton>
    </div>
  );
}
