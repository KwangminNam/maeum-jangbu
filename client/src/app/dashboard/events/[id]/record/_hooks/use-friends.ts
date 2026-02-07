"use client";

import { useState, useCallback, createContext, useContext } from "react";
import type { NewFriend } from "@/lib/types";

interface FriendsContextValue {
  // Selected existing friends
  selectedFriendIds: string[];
  toggleFriend: (friendId: string) => void;
  // New friends
  newFriends: NewFriend[];
  newName: string;
  newRelation: string;
  setNewName: (name: string) => void;
  setNewRelation: (relation: string) => void;
  addNewFriend: () => void;
  removeNewFriend: (index: number) => void;
  // Computed
  hasPendingNewFriend: boolean;
  totalPeople: number;
  getAllNewFriends: () => NewFriend[];
}

export const FriendsContext = createContext<FriendsContextValue | null>(null);

export function useFriendsContext() {
  const context = useContext(FriendsContext);
  if (!context) {
    throw new Error("useFriendsContext must be used within FriendsProvider");
  }
  return context;
}

export function useFriends() {
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [newFriends, setNewFriends] = useState<NewFriend[]>([]);
  const [newName, setNewName] = useState("");
  const [newRelation, setNewRelation] = useState("");

  const hasPendingNewFriend = Boolean(newName.trim() && newRelation.trim());

  const totalPeople =
    selectedFriendIds.length + newFriends.length + (hasPendingNewFriend ? 1 : 0);

  const toggleFriend = useCallback((friendId: string) => {
    setSelectedFriendIds((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  }, []);

  const addNewFriend = useCallback(() => {
    if (!newName.trim() || !newRelation.trim()) return;
    setNewFriends((prev) => [
      ...prev,
      { name: newName.trim(), relation: newRelation.trim() },
    ]);
    setNewName("");
    setNewRelation("");
  }, [newName, newRelation]);

  const removeNewFriend = useCallback((index: number) => {
    setNewFriends((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const getAllNewFriends = useCallback(() => {
    const friends = [...newFriends];
    if (newName.trim() && newRelation.trim()) {
      friends.push({ name: newName.trim(), relation: newRelation.trim() });
    }
    return friends;
  }, [newFriends, newName, newRelation]);

  return {
    selectedFriendIds,
    toggleFriend,
    newFriends,
    newName,
    newRelation,
    setNewName,
    setNewRelation,
    addNewFriend,
    removeNewFriend,
    hasPendingNewFriend,
    totalPeople,
    getAllNewFriends,
  };
}
