"use client";

import { useRouter } from "next/navigation"; // Използване на useRouter от Next.js
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProfilePage from "@/components/ProfilePage";

export default function ProfilePageContainer() {
  const router = useRouter();

  const handleEdit = () => {
    router.push("/profile/edit"); // Навигация към страницата за редактиране на профила
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-gray-100 flex justify-center items-center py-12">
        <ProfilePage onEdit={handleEdit} />
      </main>
      <Footer />
    </div>
  );
}
