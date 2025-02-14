"use client";

import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatContent from "@/components/ChatContent";

export default function ChatPageWrapper() {
  return (
    <div className="flex flex-col min-h-screen bg-yellow-50">
      <Navbar />
      <Suspense
        fallback={
          <main className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-yellow-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Зареждане на чат...</p>
            </div>
          </main>
        }
      >
        <ChatContent />
      </Suspense>
      <Footer />
    </div>
  );
}
