"use client";

import { useRouter } from "next/navigation"; // Correct import for Next.js 13+ app directory
import Footer from "@/components/Footer";
import Register from "@/components/Register";
import Navbar from "@/components/Navbar";

export default function RegisterPage() {
  const router = useRouter(); // Using the correct router

  const handleSuccess = () => {
    router.push("/login"); // Redirect to the login page after successful registration
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-gray-100 flex justify-center items-center py-12">
        <Register onSuccess={handleSuccess} />
      </main>
      <Footer />
    </div>
  );
}
