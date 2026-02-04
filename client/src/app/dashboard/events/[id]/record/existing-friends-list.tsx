"use client";

import { use } from "react";
import { Check, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { Friend } from "@/lib/api";

interface ExistingFriendsListProps {
  friendsPromise: Promise<Friend[]>;
  selectedFriendIds: string[];
  onToggle: (friendId: string) => void;
}

export function ExistingFriendsList({
  friendsPromise,
  selectedFriendIds,
  onToggle,
}: ExistingFriendsListProps) {
  const existingFriends = use(friendsPromise);

  if (existingFriends.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 mb-4 border shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Users size={16} className="text-primary-foreground" />
          </div>
          <Label className="text-sm font-semibold">기존 지인 선택</Label>
        </div>
        {selectedFriendIds.length > 0 && (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-accent text-accent-foreground">
            {selectedFriendIds.length}명 선택
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
        {existingFriends.map((friend) => {
          const isSelected = selectedFriendIds.includes(friend.id);
          return (
            <div
              key={friend.id}
              className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "bg-accent border border-primary/30"
                  : "bg-secondary hover:bg-muted border border-transparent"
              }`}
              onClick={() => onToggle(friend.id)}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {friend.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-sm">{friend.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {friend.relation}
                  </div>
                </div>
              </div>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isSelected
                    ? "bg-primary"
                    : "border-2 border-muted-foreground/30"
                }`}
              >
                {isSelected && <Check size={14} className="text-primary-foreground" />}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function ExistingFriendsListSkeleton() {
  return (
    <Card className="p-4 mb-4 border shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-muted animate-pulse" />
        <div className="h-5 w-24 bg-muted rounded animate-pulse" />
      </div>
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary animate-pulse">
            <div className="w-9 h-9 rounded-full bg-muted" />
            <div className="flex-1">
              <div className="h-4 w-20 bg-muted rounded mb-1" />
              <div className="h-3 w-14 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
