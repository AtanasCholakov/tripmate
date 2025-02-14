"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UserProfileView from "@/components/UserProfileView";

export default function UserProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const id = pathname.split("/").pop();
    if (id) {
      setUserId(id);
    }
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        {userId ? (
          <UserProfileView userId={userId} />
        ) : (
          <p>Loading user profile...</p>
        )}
      </main>
      <Footer />
    </div>
  );
}
