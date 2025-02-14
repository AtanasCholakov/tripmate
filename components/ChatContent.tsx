"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ChatPage from "@/components/ChatPage";
import { auth } from "@/lib/firebase";

export default function ChatContent() {
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
    <main className="flex-grow">
      <ChatPage initialUserId={userId || undefined} />
    </main>
  );
}
