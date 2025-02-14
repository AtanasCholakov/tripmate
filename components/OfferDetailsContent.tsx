"use client";

import { useSearchParams } from "next/navigation";
import OfferDetails from "@/components/OfferDetails";

export default function OfferDetailsContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const uid = searchParams.get("uid");

  if (!id || !uid) {
    return (
      <main className="flex-grow bg-gray-100 flex justify-center items-center py-12">
        <p className="text-gray-600 text-lg">
          Липсват данни за обявата. Моля, опитайте отново.
        </p>
      </main>
    );
  }

  return (
    <main className="flex-grow bg-gray-100 flex justify-center items-center py-12">
      <OfferDetails />
    </main>
  );
}
