"use client";

import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdEditContent from "@/components/AdEditContent";

export default function AdEditPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Suspense
        fallback={
          <main className="flex-grow bg-gray-100 flex justify-center items-center">
            <div className="text-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p>Зареждане...</p>
            </div>
          </main>
        }
      >
        <AdEditContent />
      </Suspense>
      <Footer />
    </div>
  );
}
