"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { applyActionCode } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { motion } from "framer-motion";

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const oobCode = searchParams.get("oobCode");

    if (!oobCode) {
      setStatus("error");
      setError("Невалиден линк за верификация.");
      return;
    }

    const verifyEmail = async () => {
      try {
        await applyActionCode(auth, oobCode);

        // Update Firestore
        if (auth.currentUser) {
          await updateDoc(doc(db, "users", auth.currentUser.uid), {
            emailVerified: true,
          });
        }

        setStatus("success");
      } catch (error) {
        console.error("Грешка при верифициране на имейл:", error);
        setStatus("error");
        setError("Неуспешно верифициране на имейла. Опитайте отново.");
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-yellow-50 to-white relative overflow-hidden">
      {/* Декоративни елементи */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-yellow-300 opacity-50 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-yellow-500 opacity-30 rounded-full blur-xl animate-pulse-slow"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md relative z-10"
      >
        {status === "verifying" && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-500 mb-4"></div>
            <p className="text-center text-gray-800 font-medium">
              Проверяваме вашия имейл...
            </p>
          </div>
        )}
        {status === "success" && (
          <>
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
              Имейлът е <span className="text-yellow-500">успешно</span>{" "}
              верифициран!
            </h1>
            <p className="text-center text-gray-600 mb-6">
              Вашият имейл е успешно потвърден. Сега можете да влезете в акаунта
              си.
            </p>
            <a
              href="/login"
              className="block w-full text-center bg-yellow-500 text-white py-2 rounded-bl-xl rounded-tr-xl font-bold hover:bg-yellow-600 transition duration-300"
            >
              Вход
            </a>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="text-3xl font-bold text-center text-red-600 mb-4">
              Верификацията е неуспешна
            </h1>
            <p className="text-center text-gray-600 mb-6">{error}</p>
            <a
              href="/register"
              className="block w-full text-center bg-yellow-500 text-white py-2 rounded-bl-xl rounded-tr-xl font-bold hover:bg-yellow-600 transition duration-300"
            >
              Регистрация
            </a>
          </>
        )}
      </motion.div>
    </div>
  );
}
