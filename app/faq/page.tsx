"use client";

import Navbar from "@/components/Navbar"; // Компонентът за навигация
import Footer from "@/components/Footer"; // Компонентът за футър
import Faq from "@/components/Faq"; // Компонентът за често задавани въпроси

export default function FaqPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
