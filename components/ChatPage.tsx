"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (initialUserId && currentUser) {
      startOrOpenChat(initialUserId);
    }
  }, [initialUserId, currentUser]);

  const startOrOpenChat = async (userId: string) => {
    if (!currentUser) return;

    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("participants", "array-contains", currentUser.uid)
    );
    const querySnapshot = await getDocs(q);

    let existingChatId = null;
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
      });
      setSelectedChat(newChatRef.id);
    }
  };

  const handleChatSelect = (chatId: string) => {
    setSelectedChat(chatId);
  };

  return (
    <div className="flex flex-col mt-6 md:flex-row h-full bg-yellow-50">
      <div className="w-full md:w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
        <ChatList onChatSelect={handleChatSelect} currentUser={currentUser} />
      </div>
      <div className="w-full md:w-2/3 h-full">
        {selectedChat ? (
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
