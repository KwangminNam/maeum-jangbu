// ── Event Types ──
export interface Event {
  id: string;
  title: string;
  type: string;
  date: string;
  records: { amount: number }[];
}

export interface EventDetail {
  id: string;
  title: string;
  type: string;
  date: string;
  records: {
    id: string;
    amount: number;
    memo: string | null;
    friend: { id: string; name: string; relation: string };
  }[];
  sentTotalAmount: number;
}

export interface CreateEvent {
  title: string;
  type: string;
  date: string;
}

// ── Friend Types ──
export interface Friend {
  id: string;
  name: string;
  relation: string;
  records: { amount: number; event: { type: string } }[];
  sentRecords?: { amount: number; eventType: string }[];
}

export interface FriendDetail {
  id: string;
  name: string;
  relation: string;
  records: {
    id: string;
    amount: number;
    memo: string | null;
    event: { title: string; type: string; date: string };
  }[];
  sentRecords: SentRecord[];
}

export interface CreateFriend {
  name: string;
  relation: string;
}

// ── Record Types ──
export interface GiftRecord {
  id: string;
  amount: number;
  memo: string | null;
  friend?: { name: string; relation: string };
  event?: { title: string; type: string; date: string };
}

export interface CreateRecord {
  amount: number;
  memo?: string;
  eventId: string;
  friendId?: string;
  friendIds?: string[];
}

export interface UpdateRecord {
  amount?: number;
  memo?: string;
}

// ── Sent Record Types ──
export interface SentRecord {
  id: string;
  amount: number;
  date: string;
  eventType: string;
  memo: string | null;
  friendId: string;
}

export interface CreateSentRecord {
  amount: number;
  date: string;
  eventType: string;
  memo?: string;
  friendId: string;
}

// ── OCR Types ──
export interface OcrRecord {
  name: string;
  amount: number;
  relation?: string;
}

export interface OcrExtractResult {
  records: OcrRecord[];
}

export interface CreateEventOcr {
  title: string;
  type: string;
  date: string;
  records: OcrRecord[];
}

export interface OcrBulkResult {
  event: Event;
  records: {
    name: string;
    amount: number;
    friendId: string;
    isNewFriend: boolean;
  }[];
  summary: {
    totalRecords: number;
    totalAmount: number;
    newFriends: number;
  };
}

// ── Gold Price Types ──
export interface GoldPriceResult {
  pricePerDon: number;
  pricePerGram: number;
  date: string;
}

// ── Form Related Types ──
export type GiftType = "cash" | "gold";

export interface NewFriend {
  name: string;
  relation: string;
}
