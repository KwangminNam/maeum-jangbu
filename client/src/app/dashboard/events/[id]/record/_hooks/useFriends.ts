"use client";

import { useReducer, useCallback, createContext, useContext } from "react";
import type { NewFriend } from "@/lib/types";

// ─── State & Actions ───
interface FriendsState {
  selectedFriendIds: string[];
  newFriends: NewFriend[];
  newName: string;
  newRelation: string;
}

type FriendsAction =
  | { type: "TOGGLE_FRIEND"; payload: string }
  | { type: "SET_NEW_NAME"; payload: string }
  | { type: "SET_NEW_RELATION"; payload: string }
  | { type: "ADD_NEW_FRIEND" }
  | { type: "REMOVE_NEW_FRIEND"; payload: number };

const initialState: FriendsState = {
  selectedFriendIds: [],
  newFriends: [],
  newName: "",
  newRelation: "",
};

const friendsReducer = (state: FriendsState, action: FriendsAction): FriendsState => {
  switch (action.type) {
    case "TOGGLE_FRIEND": {
      const id = action.payload;
      const exists = state.selectedFriendIds.includes(id);
      return {
        ...state,
        selectedFriendIds: exists
          ? state.selectedFriendIds.filter((fid) => fid !== id)
          : [...state.selectedFriendIds, id],
      };
    }
    case "SET_NEW_NAME":
      return { ...state, newName: action.payload };
    case "SET_NEW_RELATION":
      return { ...state, newRelation: action.payload };
    case "ADD_NEW_FRIEND": {
      if (!state.newName.trim() || !state.newRelation.trim()) return state;
      return {
        ...state,
        newFriends: [
          ...state.newFriends,
          { name: state.newName.trim(), relation: state.newRelation.trim() },
        ],
        newName: "",
        newRelation: "",
      };
    }
    case "REMOVE_NEW_FRIEND":
      return {
        ...state,
        newFriends: state.newFriends.filter((_, i) => i !== action.payload),
      };
    default:
      return action satisfies never;
  }
};

// ─── Context ───
interface FriendsContextValue {
  selectedFriendIds: string[];
  toggleFriend: (friendId: string) => void;
  newFriends: NewFriend[];
  newName: string;
  newRelation: string;
  setNewName: (name: string) => void;
  setNewRelation: (relation: string) => void;
  addNewFriend: () => void;
  removeNewFriend: (index: number) => void;
  hasPendingNewFriend: boolean;
  totalPeople: number;
  getAllNewFriends: () => NewFriend[];
}

export const FriendsContext = createContext<FriendsContextValue | null>(null);

export const useFriendsContext = () => {
  const context = useContext(FriendsContext);
  if (!context) {
    throw new Error("useFriendsContext must be used within FriendsProvider");
  }
  return context;
};

export const useFriends = () => {
  const [state, dispatch] = useReducer(friendsReducer, initialState);

  const hasPendingNewFriend = Boolean(state.newName.trim() && state.newRelation.trim());

  const totalPeople =
    state.selectedFriendIds.length +
    state.newFriends.length +
    (hasPendingNewFriend ? 1 : 0);

  const toggleFriend = useCallback((friendId: string) => {
    dispatch({ type: "TOGGLE_FRIEND", payload: friendId });
  }, []);

  const setNewName = useCallback((name: string) => {
    dispatch({ type: "SET_NEW_NAME", payload: name });
  }, []);

  const setNewRelation = useCallback((relation: string) => {
    dispatch({ type: "SET_NEW_RELATION", payload: relation });
  }, []);

  const addNewFriend = useCallback(() => {
    dispatch({ type: "ADD_NEW_FRIEND" });
  }, []);

  const removeNewFriend = useCallback((index: number) => {
    dispatch({ type: "REMOVE_NEW_FRIEND", payload: index });
  }, []);

  const getAllNewFriends = useCallback(() => {
    const friends = [...state.newFriends];
    if (state.newName.trim() && state.newRelation.trim()) {
      friends.push({ name: state.newName.trim(), relation: state.newRelation.trim() });
    }
    return friends;
  }, [state.newFriends, state.newName, state.newRelation]);

  return {
    selectedFriendIds: state.selectedFriendIds,
    toggleFriend,
    newFriends: state.newFriends,
    newName: state.newName,
    newRelation: state.newRelation,
    setNewName,
    setNewRelation,
    addNewFriend,
    removeNewFriend,
    hasPendingNewFriend,
    totalPeople,
    getAllNewFriends,
  };
};
