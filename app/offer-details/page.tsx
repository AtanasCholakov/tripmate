"use client";

import { Suspense } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import OfferDetailsContent from "@/components/OfferDetailsContent";

export default function OfferDetailsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Suspense
        fallback={
          <main className="flex-grow bg-gray-100 flex justify-center items-center py-12">
            <div className="text-center">
              <div className="relative w-40 h-2 bg-gray-300 rounded-full mb-4">
                <div className="absolute top-0 left-0 h-full bg-green-500 rounded-full animate-progressBar"></div>
              </div>
              <p className="text-gray-600 text-lg">Зареждане на обявата...</p>
            </div>
          </main>
        }
      >
        <OfferDetailsContent />
      </Suspense>
      <Footer />
    </div>
  );
}
