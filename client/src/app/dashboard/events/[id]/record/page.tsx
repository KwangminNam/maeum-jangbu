import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { createFetchClient } from "@/lib/fetch-client";
import { auth } from "@/lib/auth";
import { RecordForm } from "./record-form";
import type { Friend } from "@/lib/api";

async function getFriends(): Promise<Friend[]> {
  const session = await auth();
  if (!session?.accessToken) return [];

  const serverClient = createFetchClient(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
  );
  serverClient.setAuthToken(session.accessToken);

  try {
    return await serverClient.get<Friend[]>("/friends");
  } catch {
    return [];
  }
}

function RecordFormSkeleton() {
  return (
    <div className="flex flex-col px-5 pt-14 pb-4 min-h-dvh">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-5 w-5 bg-muted rounded animate-pulse" />
        <div className="h-6 w-24 bg-muted rounded animate-pulse" />
      </div>
      <div className="space-y-6">
        <div className="h-20 bg-muted rounded animate-pulse" />
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-3 animate-pulse">
              <div className="h-10 bg-muted rounded" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

async function RecordFormContent({ eventId }: { eventId: string }) {
  const friendsPromise = getFriends();

  return <RecordForm eventId={eventId} friendsPromise={friendsPromise} />;
}

export default async function RecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<RecordFormSkeleton />}>
      <RecordFormContent eventId={id} />
    </Suspense>
  );
}
