"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EditProfileForm from "@/components/EditProfileForm";

export default function EditProfilePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-gray-100 flex justify-center items-center py-12">
        <EditProfileForm />
      </main>
      <Footer />
    </div>
  );
}
