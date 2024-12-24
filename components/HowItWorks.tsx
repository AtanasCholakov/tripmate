"use client";

import { useEffect, useState } from "react";
import { auth } from "../lib/firebase"; // Уверете се, че използвате Firebase Auth

const HowItWorks = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Проверка на текущото състояние на потребителя
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user); // Задава true, ако потребителят е влязъл, иначе false
    });

    return () => unsubscribe(); // Изчистване на слушателя при размонтиране
  }, []);

  if (isLoggedIn) {
    return null; // Скриваме секцията, ако потребителят е влязъл
  }

  return (
    <section className="py-16 bg-gray-100">
      <h2 className="text-center text-3xl font-bold mb-12">
        Как работи TripMate?
      </h2>
      <div className="relative mx-auto max-w-3xl">
        {/* Стъпки */}
        <div className="relative z-10 space-y-16">
          <div className="flex items-start space-x-6">
            <div className="bg-yellow-500 text-white rounded-full h-12 w-12 flex items-center justify-center text-lg font-bold">
              1
            </div>
            <p className="text-lg leading-relaxed">
              Регистрирай се или влез в профила си
            </p>
          </div>
          <div className="flex items-start space-x-6">
            <div className="bg-yellow-500 text-white rounded-full h-12 w-12 flex items-center justify-center text-lg font-bold">
              2
            </div>
            <p className="text-lg leading-relaxed">
              Намери или публикувай обява за пътуване
            </p>
          </div>
          <div className="flex items-start space-x-6">
            <div className="bg-yellow-500 text-white rounded-full h-12 w-12 flex items-center justify-center text-lg font-bold">
              3
            </div>
            <p className="text-lg leading-relaxed">Пътувай удобно и изгодно!</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
