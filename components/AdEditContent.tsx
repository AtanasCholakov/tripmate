"use client";

import { useRouter, useSearchParams } from "next/navigation";
import EditAdForm from "@/components/EditAdForm";

interface AdData {
  start: string;
  end: string;
  date: string;
  seats: number;
  car?: string;
  description?: string;
  userId: string;
}

export default function AdEditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const adId = searchParams.get("id");

  if (!adId) {
    return (
      <main className="flex-grow bg-gray-100 flex justify-center items-center">
        <div className="text-center p-4 bg-white rounded shadow">
          <h1 className="text-xl font-bold mb-2">Грешка</h1>
          <p>Няма намерена обява за редактиране.</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Към началната страница
          </button>
        </div>
      </main>
    );
  }

  const handleAdUpdate = (updatedAdId: string, adData: AdData) => {
    const { start, end, date, seats, car, description, userId } = adData;
    router.push(
      `/offer-details?id=${encodeURIComponent(
        updatedAdId
      )}&uid=${encodeURIComponent(userId)}&start=${encodeURIComponent(
        start
      )}&end=${encodeURIComponent(end)}&date=${encodeURIComponent(
        date
      )}&seats=${seats}&car=${encodeURIComponent(
        car || ""
      )}&description=${encodeURIComponent(description || "")}`
    );
  };

  return (
    <main className="flex-grow bg-gray-100 flex justify-center items-center py-12">
      <EditAdForm adId={adId} onAdUpdate={handleAdUpdate} />
    </main>
  );
}
