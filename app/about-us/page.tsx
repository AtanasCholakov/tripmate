"use client";

import Footer from "@/components/Footer"; // Импортиране на компонент за футър
import Navbar from "@/components/Navbar"; // Компонентът за навигация
import AboutUs from "@/components/AboutUs"; // Компонентът за страницата "За нас"

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <AboutUs />
      </main>
      <Footer />
    </div>
  );
}
