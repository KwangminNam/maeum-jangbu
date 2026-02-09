import { client } from "./fetch-client";
import type {
  Event,
  EventDetail,
  CreateEvent,
  Friend,
  FriendDetail,
  CreateFriend,
  GiftRecord,
  CreateRecord,
  UpdateRecord,
  SentRecord,
  CreateSentRecord,
  OcrExtractResult,
  CreateEventOcr,
  OcrBulkResult,
  GoldPriceResult,
} from "./types";

// ── API Methods ──
export const api = {
  events: {
    list: () => client.get<Event[]>("/events"),
    get: (id: string) => client.get<EventDetail>(`/events/${id}`),
    create: (data: CreateEvent) => client.post<Event>("/events", data),
    update: (id: string, data: Partial<CreateEvent>) => client.patch<Event>(`/events/${id}`, data),
    delete: (id: string) => client.delete(`/events/${id}`),
    ocr: (image: string) => client.post<OcrExtractResult>("/events/ocr", { image }),
    ocrBulk: (data: CreateEventOcr) => client.post<OcrBulkResult>("/events/ocr-bulk", data),
    getGoldPrice: () => client.get<GoldPriceResult>("/events/gold-price"),
  },

  friends: {
    list: () => client.get<Friend[]>("/friends"),
    get: (id: string) => client.get<FriendDetail>(`/friends/${id}`),
    create: (data: CreateFriend) => client.post<Friend>("/friends", data),
    update: (id: string, data: Partial<CreateFriend>) => client.patch<Friend>(`/friends/${id}`, data),
    delete: (id: string) => client.delete(`/friends/${id}`),
  },

  records: {
    byEvent: (eventId: string) => client.get<GiftRecord[]>("/records", { eventId }),
    byFriend: (friendId: string) => client.get<GiftRecord[]>("/records", { friendId }),
    create: (data: CreateRecord) => client.post<GiftRecord>("/records", data),
    update: (id: string, data: UpdateRecord) => client.patch<GiftRecord>(`/records/${id}`, data),
    delete: (id: string) => client.delete(`/records/${id}`),
  },

  sentRecords: {
    byFriend: (friendId: string) => client.get<SentRecord[]>("/sent-records", { friendId }),
    create: (data: CreateSentRecord) => client.post<SentRecord>("/sent-records", data),
    delete: (id: string) => client.delete(`/sent-records/${id}`),
  },
};

// Re-export types for backward compatibility
export type {
  ApiResponse,
  ApiError,
  Event,
  EventDetail,
  CreateEvent,
  Friend,
  FriendDetail,
  CreateFriend,
  GiftRecord,
  CreateRecord,
  UpdateRecord,
  SentRecord,
  CreateSentRecord,
  OcrRecord,
  OcrExtractResult,
  CreateEventOcr,
  OcrBulkResult,
  GoldPriceResult,
  GiftType,
  NewFriend,
} from "./types";

export { client, ApiException } from "./fetch-client";
