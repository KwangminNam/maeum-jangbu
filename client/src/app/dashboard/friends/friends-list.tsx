"use client";

import { useState, useRef, useCallback } from "react";
import { Suspense } from "@/components/ui/suspense";
import { Plus, Search, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { api, type Friend } from "@/lib/api";
import { FriendCards, FriendCardsSkeleton } from "./friend-cards";

const RELATION_FILTERS = ["전체", "친구", "직장", "가족", "기타"];
const RELATION_SUGGESTIONS = ["친구", "직장 동료", "가족", "친척", "선후배", "지인"];

interface FriendsListProps {
  friendsPromise: Promise<Friend[]>;
}

export function FriendsList({ friendsPromise }: FriendsListProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("전체");
  const [newName, setNewName] = useState("");
  const [newRelation, setNewRelation] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [localFriends, setLocalFriends] = useState<Friend[]>([]);
  const initialLoadDone = useRef(false);

  const handleFriendsLoaded = useCallback((friends: Friend[]) => {
    if (!initialLoadDone.current) {
      setLocalFriends(friends);
      initialLoadDone.current = true;
    }
  }, []);

  const handleAddFriend = async () => {
    try {
      const newFriend = await api.friends.create({
        name: newName,
        relation: newRelation,
      });
      setLocalFriends((prev) => [...prev, newFriend]);
      setNewName("");
      setNewRelation("");
      setDialogOpen(false);
    } catch {
      alert("지인 추가에 실패했습니다");
    }
  };

  const hasLocalAdditions = localFriends.length > 0 && initialLoadDone.current;

  return (
    <div className="flex flex-col px-5 pt-14 pb-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            지인 관리
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">소중한 인연을 관리하세요</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-full shadow-md">
              <Plus size={16} className="mr-1" />
              추가
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[350px] rounded-2xl">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <UserPlus size={20} className="text-primary-foreground" />
                </div>
                <DialogTitle className="text-lg">지인 추가</DialogTitle>
              </div>
            </DialogHeader>
            <div className="flex flex-col gap-4 mt-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name" className="text-sm font-medium">이름</Label>
                <Input
                  id="name"
                  placeholder="이름을 입력하세요"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="relation" className="text-sm font-medium">관계</Label>
                <Input
                  id="relation"
                  placeholder="예: 직장 동료, 고교 동창"
                  value={newRelation}
                  onChange={(e) => setNewRelation(e.target.value)}
                  className="h-11 rounded-xl"
                />
                <div className="flex gap-1.5 flex-wrap mt-1">
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
              </div>
              <Button
                onClick={handleAddFriend}
                disabled={!newName || !newRelation}
                className="h-12 rounded-xl font-semibold"
              >
                추가하기
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 검색 */}
      <div className="relative mb-4">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
          <Search size={14} className="text-muted-foreground" />
        </div>
        <Input
          placeholder="이름으로 검색"
          className="pl-14 h-12 rounded-xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 필터 */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {RELATION_FILTERS.map((f) => (
          <button
            key={f}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 shrink-0 ${
              filter === f
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* 지인 목록 */}
      {hasLocalAdditions ? (
        <FriendCardsLocal
          friends={localFriends}
          search={search}
          filter={filter}
        />
      ) : (
        <Suspense.Skeleton skeleton={<FriendCardsSkeleton />}>
          <FriendCards
            friendsPromise={friendsPromise}
            search={search}
            filter={filter}
            onFriendsLoaded={handleFriendsLoaded}
          />
        </Suspense.Skeleton>
      )}
    </div>
  );
}

import Link from "next/link";
import { ChevronRight, CheckCircle2 } from "lucide-react";

function FriendCardsLocal({
  friends,
  search,
  filter,
}: {
  friends: Friend[];
  search: string;
  filter: string;
}) {
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
        const totalAmount = friend.records.reduce((sum, r) => sum + r.amount, 0);
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
