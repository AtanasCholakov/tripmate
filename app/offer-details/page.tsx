"use client";

import { useSearchParams } from "next/navigation"; // Използване на useSearchParams от Next.js
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import OfferDetails from "@/components/OfferDetails"; // Импортиране на компонента OfferDetails

export default function OfferDetailsPage() {
  const searchParams = useSearchParams();

  // Извличане на параметри от URL-то
  const id = searchParams.get("id");
  const uid = searchParams.get("uid");

  // Проверка за липсващи параметри
  if (!id || !uid) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow bg-gray-100 flex justify-center items-center py-12">
          <p className="text-gray-600 text-lg">
            Липсват данни за обявата. Моля, опитайте отново.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-gray-100 flex justify-center items-center py-12">
        <OfferDetails />{" "}
      </main>
      <Footer />
    </div>
  );
}
