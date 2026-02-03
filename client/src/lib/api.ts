import { client } from "./fetch-client";

// ── API Methods ──
export const api = {
  events: {
    list: () => client.get<Event[]>("/events"),
    get: (id: string) => client.get<EventDetail>(`/events/${id}`),
    create: (data: CreateEvent) => client.post<Event>("/events", data),
    update: (id: string, data: Partial<CreateEvent>) => client.patch<Event>(`/events/${id}`, data),
    delete: (id: string) => client.delete(`/events/${id}`),
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
    delete: (id: string) => client.delete(`/records/${id}`),
  },
};

// ── Types ──
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
    friend: { name: string; relation: string };
  }[];
}

export interface Friend {
  id: string;
  name: string;
  relation: string;
  records: { amount: number; event: { type: string } }[];
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
}

export interface GiftRecord {
  id: string;
  amount: number;
  memo: string | null;
  friend?: { name: string; relation: string };
  event?: { title: string; type: string; date: string };
}

export interface CreateEvent {
  title: string;
  type: string;
  date: string;
}

export interface CreateFriend {
  name: string;
  relation: string;
}

export interface CreateRecord {
  amount: number;
  memo?: string;
  eventId: string;
  friendId?: string;
  friendIds?: string[];
}

export { client };
