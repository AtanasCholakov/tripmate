"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatPage from "@/components/ChatPage";
import { auth } from "@/lib/firebase";

export default function ChatPageWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen bg-yellow-50">
      <Navbar />
      <main className="flex-grow">
        <ChatPage initialUserId={userId || undefined} />
      </main>
      <Footer />
    </div>
  );
}
