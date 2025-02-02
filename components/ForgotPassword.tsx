"use client";

import { useState } from "react";
import { auth } from "../lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { motion } from "framer-motion";
import Link from "next/link";
import type React from "react"; // Added import for React

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(
        "Изпратен е имейл за възстановяване на паролата. Моля, проверете входящата си поща."
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
      case "auth/invalid-email":
        return "Невалиден имейл адрес!";
      case "auth/user-not-found":
        return "Не е намерен потребител с този имейл адрес.";
      default:
        return "Възникна грешка при изпращането на имейл за възстановяване на паролата. Моля, опитайте отново.";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg"
    >
      <h1 className="text-center text-2xl font-bold mb-6">
        Възстановяване на парола
      </h1>
      <form onSubmit={handleResetPassword} className="flex flex-col space-y-4">
        <input
          type="email"
          placeholder="Имейл адрес"
          className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {message && (
          <div
            className={`text-sm ${
              message.includes("Изпратен") ? "text-green-500" : "text-red-500"
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
            {loading ? "Изпращане..." : "Изпрати имейл за възстановяване"}
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
  );
};

export default ForgotPassword;
