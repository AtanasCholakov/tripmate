"use client";

import { motion } from "framer-motion";

export default function RegisterConfirmation() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md relative overflow-hidden"
      >
        {/* Декоративни жълти елементи */}
        <div className="absolute -top-6 -left-6 w-24 h-24 bg-yellow-300 opacity-50 rounded-full blur-xl"></div>
        <div className="absolute top-6 -right-6 w-28 h-28 bg-yellow-500 opacity-30 rounded-full blur-xl"></div>

        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-6 relative z-10">
          Регистрацията е <span className="text-yellow-500">успешна</span>!
        </h1>
        <p className="text-center text-gray-700 mb-6 relative z-10">
          Имейл за верификация е изпратен към вашата поща. Моля, натиснете линка
          в имейла, за да потвърдите акаунта си.
        </p>
        <p className="text-center text-gray-600 relative z-10">
          <strong>Важно:</strong> Линкът ще ви пренасочи към страницата за
          верификация.
        </p>

        {/* Жълта лента в долната част */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
      </motion.div>
    </div>
  );
}
