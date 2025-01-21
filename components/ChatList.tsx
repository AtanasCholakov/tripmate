"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDoc,
  doc,
  type DocumentData,
  type Firestore,
  getDocs,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { User } from "firebase/auth";
import { MessageCircle, Search, Trash2 } from "lucide-react";

interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: Date;
  otherUserName: string;
  otherUserUsername: string;
  deletedFor: string[];
}

interface ChatListProps {
  onChatSelect: (chatId: string) => void;
  currentUser: User | null;
}

export default function ChatList({ onChatSelect, currentUser }: ChatListProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [newChatUsername, setNewChatUsername] = useState("");
  const [userSuggestions, setUserSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("participants", "array-contains", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const chatsList: Chat[] = [];
      for (const chatDoc of querySnapshot.docs) {
        const data = chatDoc.data() as DocumentData;
        if (!data.deletedFor || !data.deletedFor.includes(currentUser.uid)) {
          const otherUserId = data.participants.find(
            (id: string) => id !== currentUser.uid
          );
          const userDocRef = doc(db as Firestore, "users", otherUserId);
          const userDoc = await getDoc(userDocRef);
          const userData = userDoc.data() as DocumentData | undefined;
          chatsList.push({
            id: chatDoc.id,
            participants: data.participants,
            lastMessage: data.lastMessage || "Няма съобщения",
            lastMessageTime: data.lastMessageTime
              ? data.lastMessageTime.toDate()
              : new Date(),
            otherUserName: userData?.name || "Unknown User",
            otherUserUsername: userData?.username || "unknown",
            deletedFor: data.deletedFor || [],
          });
        }
      }
      setChats(chatsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    const fetchUserSuggestions = async () => {
      if (newChatUsername.length < 2) {
        setUserSuggestions([]);
        return;
      }

      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("username", ">=", newChatUsername),
        where("username", "<=", newChatUsername + "\uf8ff")
      );
      const querySnapshot = await getDocs(q);
      const suggestions = querySnapshot.docs
        .map((doc) => doc.data().username)
        .filter((username) => username !== currentUser?.displayName);
      setUserSuggestions(suggestions);
    };

    fetchUserSuggestions();
  }, [newChatUsername, currentUser]);

  const startNewChat = async (username: string) => {
    if (!currentUser || !username.trim()) return;

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("User not found");
        return;
      }

      const newChatUser = querySnapshot.docs[0];
      const newChatUserId = newChatUser.id;

      const existingChat = chats.find((chat) =>
        chat.participants.includes(newChatUserId)
      );
      if (existingChat) {
        onChatSelect(existingChat.id);
        setNewChatUsername("");
        return;
      }

      const chatsRef = collection(db, "chats");
      const newChatRef = await addDoc(chatsRef, {
        participants: [currentUser.uid, newChatUserId],
        createdAt: serverTimestamp(),
        lastMessage: "",
        lastMessageTime: serverTimestamp(),
      });

      onChatSelect(newChatRef.id);
      setNewChatUsername("");
    } catch (error) {
      console.error("Error starting new chat:", error);
      alert("An error occurred while starting a new chat");
    }
  };

  const deleteChat = async (chatId: string) => {
    if (!currentUser) return;

    try {
      const chatRef = doc(db, "chats", chatId);
      await updateDoc(chatRef, {
        deletedFor: arrayUnion(currentUser.uid),
      });
      setChats(chats.filter((chat) => chat.id !== chatId));
    } catch (error) {
      console.error("Error deleting chat:", error);
      alert("An error occurred while deleting the chat");
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Зареждане на чатове...</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Моите чатове</h2>
      <div className="mb-4 relative">
        <div className="relative">
          <input
            type="text"
            value={newChatUsername}
            onChange={(e) => setNewChatUsername(e.target.value)}
            placeholder="Въведете потребителско име"
            className="w-full p-2 pl-10 border rounded-full transition-all duration-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
        </div>
        {userSuggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg">
            {userSuggestions.map((username) => (
              <li
                key={username}
                className="p-2 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                onClick={() => startNewChat(username)}
              >
                {username}
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={() => startNewChat(newChatUsername)}
          className="w-full bg-yellow-500 text-white font-bold py-2 px-4 mt-3 rounded-md text-sm text-center relative overflow-hidden hover:bg-yellow-600 transition-all duration-300 transform hover:scale-105 group focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <span className="z-10 text-lg relative">Започни нов чат</span>
          <span className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 opacity-30 transform scale-0 group-hover:scale-150 transition-all duration-500 ease-out"></span>
          <span className="absolute bottom-0 left-0 w-full h-1 bg-yellow-300 transform scale-x-0 group-hover:scale-x-100 transition-all duration-500 ease-in-out"></span>
          <span className="absolute top-0 left-0 w-full h-full bg-yellow-500 opacity-20 group-hover:opacity-0 transition-all duration-500 ease-in-out"></span>
        </button>
      </div>
      {chats.length === 0 ? (
        <p className="text-gray-600 text-center">Нямате активни чатове.</p>
      ) : (
        <ul className="space-y-4 px-3">
          {chats.map((chat) => (
            <li
              key={chat.id}
              className="bg-gray-50 p-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 hover:bg-gray-100 flex items-center justify-between relative group"
              onClick={() => onChatSelect(chat.id)}
            >
              <div className="flex items-center flex-grow">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {chat.otherUserName.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">
                      {chat.otherUserName}
                    </span>
                    <span className="text-sm text-gray-500">
                      {chat.lastMessageTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">{`@${chat.otherUserUsername}`}</p>
                  <p className="text-gray-600 truncate text-sm mt-1">
                    {chat.lastMessage}
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(chat.id);
                }}
                className="ml-4 p-2 text-red-500 hover:text-red-700 transition-all duration-300 group-hover:opacity-100 opacity-60 transform hover:scale-110 relative z-10"
              >
                <Trash2 size={20} />
              </button>

              <span className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 opacity-0 group-hover:opacity-20 transition-all duration-300"></span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
