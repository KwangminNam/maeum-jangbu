"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Suspense } from "@/components/ui/suspense";
import { BackButton } from "@/components/back-button";
import { BottomCTA } from "@/components/bottom-cta";
import { api, type Friend } from "@/lib/api";
import { revalidateEventDetail, revalidateFriends } from "@/lib/actions";
import {
  AmountSelection,
  FriendInput,
  MemoInput,
  RecordSummary,
} from "./_components";

interface RecordFormProps {
  eventId: string;
  friendsPromise: Promise<Friend[]>;
}

export function RecordForm({ eventId, friendsPromise }: RecordFormProps) {
  const router = useRouter();
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <AmountSelection>
      <FriendInput>
        <RecordFormContent
          eventId={eventId}
          friendsPromise={friendsPromise}
          memo={memo}
          setMemo={setMemo}
          submitting={submitting}
          setSubmitting={setSubmitting}
          router={router}
        />
      </FriendInput>
    </AmountSelection>
  );
}

interface RecordFormContentProps {
  eventId: string;
  friendsPromise: Promise<Friend[]>;
  memo: string;
  setMemo: (memo: string) => void;
  submitting: boolean;
  setSubmitting: (submitting: boolean) => void;
  router: ReturnType<typeof useRouter>;
}

function RecordFormContent({
  eventId,
  friendsPromise,
  memo,
  setMemo,
  submitting,
  setSubmitting,
  router,
}: RecordFormContentProps) {
  const { amount, giftType, goldPrice, goldDonAmount } = AmountSelection.useContext();
  const { totalPeople, selectedFriendIds, getAllNewFriends } = FriendInput.useContext();

  const handleSubmit = async () => {
    if (amount <= 0 || totalPeople === 0) return;

    setSubmitting(true);
    try {
      const friendsToCreate = getAllNewFriends();

      const createdFriendIds: string[] = [];
      for (const friend of friendsToCreate) {
        const created = await api.friends.create(friend);
        createdFriendIds.push(created.id);
      }

      const allFriendIds = [...selectedFriendIds, ...createdFriendIds];

      let finalMemo = memo;
      if (giftType === "gold" && goldPrice) {
        const goldInfo = `금 ${goldDonAmount}돈 (시세 ${goldPrice.toLocaleString()}원/돈 기준)`;
        finalMemo = memo ? `${goldInfo} - ${memo}` : goldInfo;
      }

      await api.records.create({
        amount,
        memo: finalMemo || undefined,
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
    <div className="relative flex flex-col px-5 pt-14 pb-40 h-full overflow-y-auto">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <BackButton />
        <div>
          <h1 className="text-xl font-bold text-foreground">기록 추가</h1>
          <p className="text-xs text-muted-foreground">경조사 내역을 기록하세요</p>
        </div>
      </div>

      {/* 1. 금액 선택 */}
      <AmountSelection.Card>
        <AmountSelection.TypeToggle />
        <AmountSelection.CashSelector />
        <AmountSelection.GoldSelector />
      </AmountSelection.Card>

      {/* 2. 새 지인 추가 */}
      <FriendInput.NewFriendCard />

      {/* 3. 기존 지인 선택 */}
      <Suspense.Skeleton skeleton={<FriendInput.ExistingFriendsListSkeleton />}>
        <FriendInput.ExistingFriendsList friendsPromise={friendsPromise} />
      </Suspense.Skeleton>

      {/* 4. 메모 */}
      <MemoInput value={memo} onChange={setMemo} />

      {/* 제출 */}
      <BottomCTA
        onClick={handleSubmit}
        disabled={amount <= 0 || totalPeople === 0}
        loading={submitting}
        loadingText="등록 중..."
        summary={<RecordSummary totalPeople={totalPeople} amount={amount} />}
      >
        {totalPeople > 0 ? `${totalPeople}명 기록 등록` : "기록 등록"}
      </BottomCTA>
    </div>
  );
}
