"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, CheckCircle2, Users } from "lucide-react";
import type { Friend } from "@/lib/api";

interface FriendCardsProps {
  friendsPromise: Promise<Friend[]>;
  search: string;
  filter: string;
  onFriendsLoaded: (friends: Friend[]) => void;
}

export function FriendCards({
  friendsPromise,
  search,
  filter,
  onFriendsLoaded,
}: FriendCardsProps) {
  const friends = use(friendsPromise);

  useEffect(() => {
    onFriendsLoaded(friends);
  }, [friends, onFriendsLoaded]);

  const filtered = friends.filter((f) => {
    const matchSearch = f.name.includes(search);
    const matchFilter = filter === "전체" || f.relation.includes(filter);
    return matchSearch && matchFilter;
  });

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-4">
          <Users size={28} className="text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">
          {friends.length === 0 ? "등록된 지인이 없습니다" : "검색 결과가 없습니다"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {filtered.map((friend) => {
        const totalAmount = friend.records.reduce(
          (sum, r) => sum + r.amount,
          0
        );
        const hasSentRecords = friend.sentRecords && friend.sentRecords.length > 0;
        return (
          <Link key={friend.id} href={`/dashboard/friends/${friend.id}`}>
            <div className="p-4 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                    {friend.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{friend.name}</span>
                      {hasSentRecords && (
                        <CheckCircle2 size={14} className="text-toss-green" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">
                        {friend.relation}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {friend.records.length}건 · {totalAmount.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function FriendCardsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-4 rounded-2xl bg-card border border-border animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-muted" />
            <div className="flex-1">
              <div className="h-5 w-24 bg-muted rounded mb-2" />
              <div className="h-4 w-32 bg-muted rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
