import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { createFetchClient } from "@/lib/fetch-client";
import { auth } from "@/lib/auth";
import { FriendsList } from "./friends-list";
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

function FriendsListSkeleton() {
  return (
    <div className="flex flex-col px-5 pt-14 pb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-24 bg-muted rounded animate-pulse" />
        <div className="h-8 w-16 bg-muted rounded animate-pulse" />
      </div>
      <div className="h-10 w-full bg-muted rounded animate-pulse mb-4" />
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-6 w-12 bg-muted rounded animate-pulse" />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-12 bg-muted rounded" />
          </Card>
        ))}
      </div>
    </div>
  );
}

async function FriendsContent() {
  const friendsPromise = getFriends();

  return <FriendsList friendsPromise={friendsPromise} />;
}

export default function FriendsPage() {
  return (
    <Suspense fallback={<FriendsListSkeleton />}>
      <FriendsContent />
    </Suspense>
  );
}
