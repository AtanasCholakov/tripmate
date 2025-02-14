"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import ChatComponent from "./ChatComponent";
import ChatList from "./ChatList";
import type { User } from "firebase/auth";

interface ChatPageProps {
  initialUserId?: string;
}

export default function ChatPage({ initialUserId }: ChatPageProps) {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [availableChats, setAvailableChats] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        window.location.href = "/";
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("participants", "array-contains", currentUser.uid)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const chatIds = querySnapshot.docs.map((doc) => doc.id);
        setAvailableChats(chatIds);

        // If the selected chat is no longer available, close it
        if (selectedChat && !chatIds.includes(selectedChat)) {
          setSelectedChat(null);
        }
      });

      return () => unsubscribe();
    }
  }, [currentUser, selectedChat]);

  useEffect(() => {
    if (initialUserId && currentUser) {
      startOrOpenChat(initialUserId);
    }
  }, [initialUserId, currentUser]);

  const startOrOpenChat = async (userId: string) => {
    if (!currentUser) return;

    // Prevent starting a chat with yourself
    if (userId === currentUser.uid) {
      console.log("You can't start a chat with yourself");
      return;
    }

    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("participants", "array-contains", currentUser.uid)
    );
    const querySnapshot = await getDocs(q);

    let existingChatId: string | null = null;
    querySnapshot.forEach((doc) => {
      const chatData = doc.data();
      if (chatData.participants.includes(userId)) {
        existingChatId = doc.id;
      }
    });

    if (existingChatId) {
      setSelectedChat(existingChatId);
    } else {
      // Create a new chat
      const newChatRef = await addDoc(chatsRef, {
        participants: [currentUser.uid, userId],
        createdAt: serverTimestamp(),
        lastMessage: "",
        lastMessageTime: serverTimestamp(),
      });
      setSelectedChat(newChatRef.id);
    }
  };

  const handleChatSelect = (chatId: string) => {
    setSelectedChat(chatId);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex flex-col mt-6 md:flex-row h-full bg-yellow-50">
      <div className="w-full md:w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
        <ChatList onChatSelect={handleChatSelect} currentUser={currentUser} />
      </div>
      <div className="w-full md:w-2/3 h-full">
        {selectedChat && availableChats.includes(selectedChat) ? (
          <ChatComponent chatId={selectedChat} currentUser={currentUser} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Изберете чат или започнете нов разговор
          </div>
        )}
      </div>
    </div>
  );
}
