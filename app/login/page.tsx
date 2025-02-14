"use client";

import Footer from "@/components/Footer";
import Login from "@/components/Login";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex justify-center items-center py-12">
        <Login />
      </main>
      <Footer />
    </div>
  );
}
