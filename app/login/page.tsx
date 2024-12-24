"use client";

import { useRouter } from "next/navigation"; // Correct import for Next.js 13+ app directory
import Footer from "@/components/Footer"; // Импортиране на компонент за футър
import Login from "@/components/Login"; // Компонентът за логване
import Navbar from "@/components/Navbar"; // Компонентът за навигация

export default function LoginPage() {
  const router = useRouter(); // Използване на правилния роутер за навигация

  const handleSuccess = () => {
    router.push("/"); // Пренасочване към началната страница след успешен логин
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-gray-100 flex justify-center items-center py-12">
        <Login onSuccess={handleSuccess} />{" "}
        {/* Пренасяне на обработчика за успех в Login компонента */}
      </main>
      <Footer />
    </div>
  );
}
