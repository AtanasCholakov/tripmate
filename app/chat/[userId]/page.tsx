"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatPage from "@/components/ChatPage";
import { auth } from "@/lib/firebase";

export default function ChatPageWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/");
      }
    });

    const userIdFromUrl = searchParams.get("userId");
    if (userIdFromUrl) {
      setUserId(userIdFromUrl);
    }

    return () => unsubscribe();
  }, [router, searchParams]);

  return (
    <div className="flex flex-col min-h-screen bg-yellow-50">
      <Navbar />
      <main className="flex-grow">
        {userId ? <ChatPage initialUserId={userId} /> : <p>Loading chat...</p>}
      </main>
      <Footer />
    </div>
  );
}
