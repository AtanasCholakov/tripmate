"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebase";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValidCode, setIsValidCode] = useState(false);

  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  useEffect(() => {
    const verifyCode = async () => {
      if (oobCode) {
        try {
          await verifyPasswordResetCode(auth, oobCode);
          setIsValidCode(true);
        } catch (error) {
          console.error("Invalid or expired action code", error);
          setMessage(
            "Невалиден или изтекъл код за възстановяване на паролата."
          );
        }
      }
    };

    verifyCode();
  }, [oobCode]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("Паролите не съвпадат.");
      setLoading(false);
      return;
    }

    if (!oobCode) {
      setMessage("Липсва код за възстановяване на паролата.");
      setLoading(false);
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setMessage(
        "Паролата е успешно променена. Можете да влезете с новата си парола."
      );
    } catch (error: any) {
      console.error("Password reset error:", error);
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (error: any): string => {
    switch (error.code) {
      case "auth/weak-password":
        return "Паролата е твърде слаба. Моля, изберете по-силна парола.";
      case "auth/expired-action-code":
        return "Кодът за възстановяване на паролата е изтекъл. Моля, заявете нов.";
      default:
        return "Възникна грешка при промяната на паролата. Моля, опитайте отново.";
    }
  };

  if (!isValidCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
          <h1 className="text-center text-2xl font-bold mb-6">
            Невалиден код за възстановяване
          </h1>
          <p className="text-center text-red-500">{message}</p>
          <p className="text-center mt-4">
            <Link
              href="/forgot-password"
              className="text-green-500 hover:underline"
            >
              Заявете нов код за възстановяване
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg"
      >
        <h1 className="text-center text-2xl font-bold mb-6">
          Промяна на парола
        </h1>
        <form
          onSubmit={handleResetPassword}
          className="flex flex-col space-y-4"
        >
          <input
            type="password"
            placeholder="Нова парола"
            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Потвърдете новата парола"
            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {message && (
            <div
              className={`text-sm ${
                message.includes("успешно") ? "text-green-500" : "text-red-500"
              }`}
            >
              {message}
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className={`relative w-full bg-green-500 text-white font-bold py-3 rounded-bl-xl rounded-tr-xl overflow-hidden group ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "hover:bg-green-600 transition"
            }`}
            disabled={loading}
          >
            <span className="relative z-10">
              {loading ? "Промяна..." : "Промени паролата"}
            </span>
            {!loading && (
              <>
                <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-30 transform scale-0 group-hover:scale-150 transition-all duration-500 ease-out"></span>
                <span className="absolute bottom-0 left-0 w-full h-1 bg-green-300 transform scale-x-0 group-hover:scale-x-100 transition-all duration-500 ease-in-out"></span>
                <span className="absolute top-0 left-0 w-full h-full bg-green-500 opacity-20 group-hover:opacity-0 transition-all duration-500 ease-in-out"></span>
              </>
            )}
          </motion.button>
        </form>
        <p className="text-center mt-4">
          <Link href="/login" className="text-green-500 hover:underline">
            Обратно към вход
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
