"use client";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProfilePage from "@/components/ProfilePage";

export default function ProfilePageContainer() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-gray-100 flex justify-center items-center py-12">
        <ProfilePage />
      </main>
      <Footer />
    </div>
  );
}
