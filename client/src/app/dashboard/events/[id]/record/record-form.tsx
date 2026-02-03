"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { BackButton } from "@/components/back-button";
import { api, type Friend } from "@/lib/api";

const AMOUNT_BADGES = [
  { value: 30000, label: "3만" },
  { value: 50000, label: "5만" },
  { value: 100000, label: "10만" },
  { value: 200000, label: "20만" },
];

interface RecordFormProps {
  eventId: string;
  friendsPromise: Promise<Friend[]>;
}

export function RecordForm({ eventId, friendsPromise }: RecordFormProps) {
  const friends = use(friendsPromise);
  const router = useRouter();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const amount = selectedAmount ?? (customAmount ? Number(customAmount) : 0);

  const toggleFriend = (friendId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((fid) => fid !== friendId)
        : [...prev, friendId]
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.records.create({
        amount,
        memo: memo || undefined,
        eventId,
        friendIds: selectedFriends,
      });
      router.back();
    } catch {
      alert("기록 등록에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col px-5 pt-14 pb-4 min-h-dvh">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <BackButton />
        <h1 className="text-xl font-bold">기록 추가</h1>
      </div>

      {/* 1. 금액 선택 */}
      <div className="mb-6">
        <Label className="mb-3 block">금액 선택</Label>
        <div className="flex gap-2 flex-wrap mb-3">
          {AMOUNT_BADGES.map((badge) => (
            <Badge
              key={badge.value}
              variant={selectedAmount === badge.value ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 text-sm"
              onClick={() => {
                setSelectedAmount(badge.value);
                setCustomAmount("");
              }}
            >
              {badge.label}
            </Badge>
          ))}
        </div>
        <Input
          placeholder="직접 입력 (원)"
          type="number"
          value={customAmount}
          onChange={(e) => {
            setCustomAmount(e.target.value);
            setSelectedAmount(null);
          }}
        />
      </div>

      {/* 2. 지인 선택 (1:N) */}
      <div className="mb-6">
        <Label className="mb-3 block">
          지인 선택{" "}
          <span className="text-muted-foreground font-normal">
            ({selectedFriends.length}명 선택)
          </span>
        </Label>
        <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto">
          {friends.map((friend) => {
            const isSelected = selectedFriends.includes(friend.id);
            return (
              <Card
                key={friend.id}
                className={`p-3 cursor-pointer transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "hover:bg-accent/50"
                }`}
                onClick={() => toggleFriend(friend.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{friend.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {friend.relation}
                    </div>
                  </div>
                  {isSelected && <Check size={16} className="text-primary" />}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 3. 메모 */}
      <div className="mb-6">
        <Label htmlFor="memo" className="mb-2 block">
          메모 (선택)
        </Label>
        <Input
          id="memo"
          placeholder="메모를 입력하세요"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </div>

      {/* 제출 */}
      <div className="mt-auto pt-4">
        {amount > 0 && selectedFriends.length > 0 && (
          <p className="text-sm text-center text-muted-foreground mb-3">
            {selectedFriends.length}명 x {amount.toLocaleString()}원 ={" "}
            <span className="font-semibold text-foreground">
              {(amount * selectedFriends.length).toLocaleString()}원
            </span>
          </p>
        )}
        <Button
          className="w-full h-12 text-base"
          disabled={amount <= 0 || selectedFriends.length === 0 || submitting}
          onClick={handleSubmit}
        >
          {submitting
            ? "등록 중..."
            : selectedFriends.length > 0
              ? `${selectedFriends.length}명 일괄 등록`
              : "기록 등록"}
        </Button>
      </div>
    </div>
  );
}
