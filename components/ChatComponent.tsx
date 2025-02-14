"use client";

import { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
  type Firestore,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { User } from "firebase/auth";
import { Send, PaperclipIcon } from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date | null;
  imageUrl?: string;
}

interface ChatComponentProps {
  chatId: string;
  currentUser: User | null;
}

export default function ChatComponent({
  chatId,
  currentUser,
}: ChatComponentProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [imageUpload, setImageUpload] = useState<File | null>(null);
  const [otherUserName, setOtherUserName] = useState("");
  const [otherUserId, setOtherUserId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId || !currentUser) return;

    const fetchOtherUserName = async () => {
      const chatDoc = await getDoc(doc(db as Firestore, "chats", chatId));
      if (chatDoc.exists()) {
        const participants = chatDoc.data()?.participants as string[];
        const otherUserId = participants.find(
          (id: string) => id !== currentUser.uid
        );
        setOtherUserId(otherUserId || "");
        const userDoc = await getDoc(
          doc(db as Firestore, "users", otherUserId as string)
        );
        if (userDoc.exists()) {
          setOtherUserName(userDoc.data().name);
        }
      }
    };

    fetchOtherUserName();

    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"), limit(50));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesList: Message[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messagesList.push({
          id: doc.id,
          text: data.text,
          senderId: data.senderId,
          timestamp: data.timestamp ? data.timestamp.toDate() : null,
          imageUrl: data.imageUrl,
        });
      });
      setMessages(messagesList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !imageUpload) || !chatId || !currentUser) return;

    try {
      const messageData: any = {
        text: newMessage,
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
      };

      if (imageUpload) {
        messageData.imageUrl = "https://via.placeholder.com/150";
      }

      await addDoc(collection(db, "chats", chatId, "messages"), messageData);

      await updateDoc(doc(db as Firestore, "chats", chatId), {
        lastMessage: newMessage || "Изпратено изображение",
        lastMessageTime: serverTimestamp(),
      });

      setNewMessage("");
      setImageUpload(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageUpload(e.target.files[0]);
    }
  };

  const formatMessageDate = (date: Date | null) => {
    if (!date) return "";

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Днес";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Вчера";
    } else {
      return date.toLocaleDateString("bg-BG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-100">
      <div className="bg-white shadow-md p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">
          Чат с {otherUserName}
        </h2>
        <Link
          href={`/user/${otherUserId}`}
          className="relative text-yellow-500 font-semibold text-lg group"
        >
          <span className="relative z-10 group-hover:text-yellow-600 transition-colors duration-300">
            Виж профила
          </span>
          <span className="absolute bottom-0 left-1/2 w-full h-0.5 bg-yellow-500 origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out transform -translate-x-1/2"></span>
        </Link>
      </div>
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{
          minHeight: "calc(80vh - 200px)",
          maxHeight: "calc(80vh - 200px)",
        }}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Няма съобщения. Започнете разговор!
          </div>
        ) : (
          messages.reduce((acc: JSX.Element[], message, index) => {
            if (
              index === 0 ||
              formatMessageDate(message.timestamp) !==
                formatMessageDate(messages[index - 1].timestamp)
            ) {
              acc.push(
                <div
                  key={`date-${message.timestamp?.getTime()}`}
                  className="text-center text-gray-500 text-sm my-2"
                >
                  {formatMessageDate(message.timestamp)}
                </div>
              );
            }
            acc.push(
              <div
                key={message.id}
                className={`flex ${
                  message.senderId === currentUser?.uid
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg p-4 ${
                    message.senderId === currentUser?.uid
                      ? "bg-yellow-500 text-white shadow-md"
                      : "bg-white text-gray-800 shadow-sm"
                  }`}
                >
                  {message.imageUrl && (
                    <img
                      src={message.imageUrl || "/placeholder.svg"}
                      alt="Uploaded"
                      className="max-w-full h-auto rounded-lg mb-2"
                    />
                  )}
                  <p className="text-sm leading-relaxed break-words">
                    {message.text}
                  </p>
                  <span className="text-xs opacity-75 block mt-2 text-right">
                    {message.timestamp
                      ? message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Sending..."}
                  </span>
                </div>
              </div>
            );
            return acc;
          }, [])
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSendMessage}
        className="bg-white p-4 shadow-md rounded-lg"
      >
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Въведете съобщение..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-300 group-hover:shadow-lg"
          />

          <label className="cursor-pointer relative group">
            <PaperclipIcon className="w-6 h-6 text-gray-500 group-hover:text-yellow-500 transition-colors duration-300" />
            <input
              type="file"
              className="hidden"
              onChange={handleImageUpload}
              accept="image/*"
            />
          </label>

          <button
            type="submit"
            className="bg-yellow-500 text-white p-2 rounded-full hover:bg-yellow-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 transform hover:scale-105 group relative z-10"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {imageUpload && (
          <div className="mt-2 text-sm text-gray-600">
            Изображение готово за изпращане: {imageUpload.name}
          </div>
        )}
      </form>
    </div>
  );
}
