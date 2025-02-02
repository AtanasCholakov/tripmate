"use client";

import Footer from "@/components/Footer";
import Register from "@/components/Register";
import Navbar from "@/components/Navbar";

export default function RegisterPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex justify-center items-center py-12">
        <Register />
      </main>
      <Footer />
    </div>
  );
}
