"use client";

import { useState } from "react";
import { Suspense } from "@/components/ui/suspense";
import { useRouter } from "next/navigation";
import { Plus, X, Wallet, UserPlus, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { BackButton } from "@/components/back-button";
import { api, type Friend } from "@/lib/api";
import { revalidateEventDetail, revalidateFriends } from "@/lib/actions";
import {
  ExistingFriendsList,
  ExistingFriendsListSkeleton,
} from "./existing-friends-list";

const AMOUNT_BADGES = [
  { value: 50000, label: "5만원" },
  { value: 100000, label: "10만원" },
  { value: 150000, label: "15만원" },
  { value: 200000, label: "20만원" },
  { value: 250000, label: "25만원" },
  { value: 300000, label: "30만원" },
  { value: 350000, label: "35만원" },
  { value: 500000, label: "50만원" },
];

const RELATION_SUGGESTIONS = ["친구", "직장 동료", "가족", "친척", "선후배", "지인"];

interface RecordFormProps {
  eventId: string;
  friendsPromise: Promise<Friend[]>;
}

interface NewFriend {
  name: string;
  relation: string;
}

export function RecordForm({ eventId, friendsPromise }: RecordFormProps) {
  const router = useRouter();

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [newFriends, setNewFriends] = useState<NewFriend[]>([]);
  const [newName, setNewName] = useState("");
  const [newRelation, setNewRelation] = useState("");
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const amount = selectedAmount ?? (customAmount ? Number(customAmount) : 0);
  const hasPendingNewFriend = newName.trim() && newRelation.trim();
  const totalPeople = selectedFriendIds.length + newFriends.length + (hasPendingNewFriend ? 1 : 0);

  const toggleExistingFriend = (friendId: string) => {
    setSelectedFriendIds((prev) =>
      prev.includes(friendId)
        ? prev.filter((fid) => fid !== friendId)
        : [...prev, friendId]
    );
  };

  const addNewFriend = () => {
    if (!newName.trim() || !newRelation.trim()) return;
    setNewFriends((prev) => [...prev, { name: newName.trim(), relation: newRelation.trim() }]);
    setNewName("");
    setNewRelation("");
  };

  const removeNewFriend = (index: number) => {
    setNewFriends((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (amount <= 0 || totalPeople === 0) return;

    setSubmitting(true);
    try {
      const friendsToCreate = [...newFriends];
      if (newName.trim() && newRelation.trim()) {
        friendsToCreate.push({ name: newName.trim(), relation: newRelation.trim() });
      }

      const createdFriendIds: string[] = [];
      for (const friend of friendsToCreate) {
        const created = await api.friends.create(friend);
        createdFriendIds.push(created.id);
      }

      const allFriendIds = [...selectedFriendIds, ...createdFriendIds];

      await api.records.create({
        amount,
        memo: memo || undefined,
        eventId,
        friendIds: allFriendIds,
      });

      await revalidateEventDetail(eventId);
      if (friendsToCreate.length > 0) {
        await revalidateFriends();
      }

      router.back();
    } catch {
      alert("기록 등록에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col px-5 pt-14 pb-20 h-full">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <BackButton />
        <div>
          <h1 className="text-xl font-bold text-foreground">
            기록 추가
          </h1>
          <p className="text-xs text-muted-foreground">경조사 내역을 기록하세요</p>
        </div>
      </div>

      {/* 1. 금액 선택 */}
      <Card className="p-4 mb-4 border shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Wallet size={16} className="text-primary-foreground" />
          </div>
          <Label className="text-sm font-semibold">금액 선택</Label>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {AMOUNT_BADGES.map((badge) => (
            <button
              key={badge.value}
              type="button"
              className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                selectedAmount === badge.value
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
              onClick={() => {
                setSelectedAmount(badge.value);
                setCustomAmount("");
              }}
            >
              {badge.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Input
            placeholder="직접 입력"
            type="number"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setSelectedAmount(null);
            }}
            className="pr-10 h-11 rounded-xl"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">원</span>
        </div>
      </Card>

      {/* 2. 새 지인 입력 */}
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
                    <div className="text-xs text-muted-foreground">{friend.relation}</div>
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

      {/* 3. 기존 지인 선택 */}
      <Suspense.Skeleton skeleton={<ExistingFriendsListSkeleton />}>
        <ExistingFriendsList
          friendsPromise={friendsPromise}
          selectedFriendIds={selectedFriendIds}
          onToggle={toggleExistingFriend}
        />
      </Suspense.Skeleton>

      {/* 4. 메모 */}
      <Card className="p-4 mb-4 border shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-toss-yellow flex items-center justify-center">
            <FileText size={16} className="text-white" />
          </div>
          <Label htmlFor="memo" className="text-sm font-semibold">
            메모 <span className="text-muted-foreground font-normal">(선택)</span>
          </Label>
        </div>
        <Input
          id="memo"
          placeholder="메모를 입력하세요"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="h-11 rounded-xl"
        />
      </Card>

      {/* 제출 */}
      <div className="mt-auto py-6">
        {amount > 0 && totalPeople > 0 && (
          <Card className="p-4 mb-4 border bg-accent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Users size={14} className="text-primary-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">
                  {totalPeople}명 × {amount.toLocaleString()}원
                </span>
              </div>
              <div className="text-lg font-bold text-primary">
                {(amount * totalPeople).toLocaleString()}원
              </div>
            </div>
          </Card>
        )}
        <Button
          className="w-full h-14 text-base font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
          disabled={amount <= 0 || totalPeople === 0 || submitting}
          onClick={handleSubmit}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              등록 중...
            </span>
          ) : totalPeople > 0 ? (
            `${totalPeople}명 기록 등록`
          ) : (
            "기록 등록"
          )}
        </Button>
      </div>
    </div>
  );
}
