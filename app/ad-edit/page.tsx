"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EditAdForm from "@/components/EditAdForm";

export default function EditAdPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const adId = searchParams.get("id"); // Вземаме ID-то на обявата от URL

  if (!adId) {
    return <div>Няма намерена обява за редактиране.</div>;
  }

  const handleAdDetailsRedirect = (updatedAdId: string) => {
    router.push(`/ad-details?id=${updatedAdId}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-gray-100 flex justify-center items-center py-12">
        <EditAdForm adId={adId} onAdUpdate={handleAdDetailsRedirect} />
      </main>
      <Footer />
    </div>
  );
}
