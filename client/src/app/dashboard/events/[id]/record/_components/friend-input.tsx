"use client";

import { type ReactNode } from "react";
import { UserPlus, Plus, X, Users, Check } from "lucide-react";
import { use } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RELATION_SUGGESTIONS } from "@/lib/constants";
import type { Friend } from "@/lib/api";
import { FriendsContext, useFriendsContext, useFriends } from "../_hooks";

// ─── Root ───
interface FriendInputProps {
  children: ReactNode;
}

function FriendInputRoot({ children }: FriendInputProps) {
  const friends = useFriends();

  return (
    <FriendsContext.Provider value={friends}>{children}</FriendsContext.Provider>
  );
}

// ─── NewFriendCard ───
function NewFriendCard() {
  const {
    newName,
    newRelation,
    newFriends,
    setNewName,
    setNewRelation,
    addNewFriend,
    removeNewFriend,
  } = useFriendsContext();

  return (
    <Card className="p-4 mb-4 border shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
          <UserPlus size={16} className="text-primary-foreground" />
        </div>
        <Label className="text-sm font-semibold">새 지인 추가</Label>
      </div>

      <div className="flex gap-2 mb-3">
        <Input
          placeholder="이름"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 h-11 rounded-xl"
        />
        <Input
          placeholder="관계"
          value={newRelation}
          onChange={(e) => setNewRelation(e.target.value)}
          className="flex-1 h-11 rounded-xl"
        />
        <Button
          type="button"
          size="icon"
          onClick={addNewFriend}
          disabled={!newName.trim() || !newRelation.trim()}
          className="h-11 w-11 rounded-xl"
        >
          <Plus size={18} />
        </Button>
      </div>

      {/* 관계 추천 */}
      <div className="flex gap-1.5 flex-wrap">
        {RELATION_SUGGESTIONS.map((rel) => (
          <button
            key={rel}
            type="button"
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              newRelation === rel
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
            onClick={() => setNewRelation(rel)}
          >
            {rel}
          </button>
        ))}
      </div>

      {/* 추가된 새 지인 목록 */}
      {newFriends.length > 0 && (
        <div className="flex flex-col gap-2 mt-4">
          {newFriends.map((friend, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-xl bg-accent border border-border"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                  {friend.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-sm">{friend.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {friend.relation}
                  </div>
                </div>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                onClick={() => removeNewFriend(index)}
              >
                <X size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ─── ExistingFriendsList ───
interface ExistingFriendsListProps {
  friendsPromise: Promise<Friend[]>;
}

function ExistingFriendsList({ friendsPromise }: ExistingFriendsListProps) {
  const existingFriends = use(friendsPromise);
  const { selectedFriendIds, toggleFriend } = useFriendsContext();

  if (existingFriends.length === 0) return null;

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
              onClick={() => toggleFriend(friend.id)}
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

// ─── Skeleton ───
function ExistingFriendsListSkeleton() {
  return (
    <Card className="p-4 mb-4 border shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-muted animate-pulse" />
        <div className="h-5 w-24 bg-muted rounded animate-pulse" />
      </div>
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-xl bg-secondary animate-pulse"
          >
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

// ─── Summary ───
function Summary() {
  const { totalPeople } = useFriendsContext();

  return { totalPeople };
}

// ─── Export Compound Component ───
export const FriendInput = Object.assign(FriendInputRoot, {
  NewFriendCard,
  ExistingFriendsList,
  ExistingFriendsListSkeleton,
  Summary,
  useContext: useFriendsContext,
});
