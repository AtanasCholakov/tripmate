"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  applyActionCode,
  confirmPasswordReset,
  verifyPasswordResetCode,
} from "firebase/auth";
import { motion } from "framer-motion";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import type React from "react";

export default function AuthActionContent() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");

  useEffect(() => {
    const handleAction = async () => {
      if (!oobCode) {
        setMessage("Невалиден код за действие.");
        setLoading(false);
        return;
      }

      try {
        if (mode === "verifyEmail") {
          await applyActionCode(auth, oobCode);
          setMessage("Имейл адресът е успешно потвърден.");
          setTimeout(() => {
            router.push("/");
          }, 3000);
        } else if (mode === "resetPassword") {
          await verifyPasswordResetCode(auth, oobCode);
          setIsPasswordReset(true);
        } else {
          throw new Error("Невалиден режим на действие.");
        }
      } catch (error: unknown) {
        console.error("Action error:", error);
        setMessage(getErrorMessage(error as Error));
      } finally {
        setLoading(false);
      }
    };

    handleAction();
  }, [mode, oobCode, router]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("Паролите не съвпадат.");
      setLoading(false);
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode!, newPassword);
      setMessage(
        "Паролата е успешно променена. Можете да влезете с новата си парола."
      );
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error: unknown) {
      console.error("Password reset error:", error);
      setMessage(getErrorMessage(error as Error));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (error: Error & { code?: string }): string => {
    if (error instanceof Error && "code" in error) {
      switch (error.code) {
        case "auth/invalid-action-code":
          return "Невалиден или изтекъл код за действие. Моля, опитайте отново.";
        case "auth/user-disabled":
          return "Този потребителски акаунт е деактивиран.";
        case "auth/user-not-found":
          return "Потребителят не е намерен.";
        case "auth/weak-password":
          return "Паролата е твърде слаба. Моля, изберете по-силна парола.";
        default:
          return "Възникна грешка. Моля, опитайте отново.";
      }
    }
    return "Възникна неочаквана грешка. Моля, опитайте отново.";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg"
      >
        <h1 className="text-center text-2xl font-bold mb-6">
          {mode === "verifyEmail"
            ? "Потвърждение на имейл"
            : "Промяна на парола"}
        </h1>
        {loading ? (
          <p className="text-center">Обработване...</p>
        ) : isPasswordReset ? (
          <form
            onSubmit={handleResetPassword}
            className="flex flex-col space-y-4"
          >
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Нова парола"
                className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Потвърдете новата парола"
                className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="relative w-full bg-green-500 text-white font-bold py-3 rounded-bl-xl rounded-tr-xl overflow-hidden group hover:bg-green-600 transition"
            >
              <span className="relative z-10">Промени паролата</span>
              <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-30 transform scale-0 group-hover:scale-150 transition-all duration-500 ease-out"></span>
              <span className="absolute bottom-0 left-0 w-full h-1 bg-green-300 transform scale-x-0 group-hover:scale-x-100 transition-all duration-500 ease-in-out"></span>
              <span className="absolute top-0 left-0 w-full h-full bg-green-500 opacity-20 group-hover:opacity-0 transition-all duration-500 ease-in-out"></span>
            </motion.button>
          </form>
        ) : (
          <>
            <p
              className={`text-center ${
                message.includes("успешно") ? "text-green-500" : "text-red-500"
              }`}
            >
              {message}
            </p>
            {!message.includes("успешно") && (
              <p className="text-center mt-4">
                <Link href="/login" className="text-green-500 hover:underline">
                  Обратно към вход
                </Link>
              </p>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
