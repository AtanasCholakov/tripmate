"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatPage from "@/components/ChatPage";
import { auth } from "@/lib/firebase";

interface PageProps {
  params: {
    userId: string;
  };
}

export default function ChatPageWrapper({ params }: PageProps) {
  const router = useRouter();
  const { userId } = params;

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
        <ChatPage initialUserId={userId} />
      </main>
      <Footer />
    </div>
  );
}
