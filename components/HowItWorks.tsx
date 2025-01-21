"use client";

import { useEffect, useState } from "react";
import { auth } from "../lib/firebase"; // Уверете се, че използвате Firebase Auth
import Link from "next/link";

const HowItWorks = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  if (isLoggedIn) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Декоративни кръгове */}
      <div className="absolute top-12 left-0 w-40 h-40 bg-yellow-300 opacity-50 rounded-full blur-3xl animate-pulse transform translate-y-10"></div>
      <div className="absolute top-20 right-10 w-48 h-48 bg-yellow-500 opacity-30 rounded-full blur-2xl animate-pulse-slow"></div>

      <h2 className="text-center text-3xl font-extrabold text-gray-800 mb-16">
        Как работи <span className="text-yellow-500">TripMate</span>?
      </h2>

      <div className="relative z-10 mx-auto max-w-3xl space-y-12">
        {/* Стъпки */}
        {[
          {
            id: 1,
            text: (
              <>
                <Link
                  href="/register"
                  className="text-yellow-500 font-bold hover:text-yellow-600 underline decoration-2 decoration-yellow-500 hover:decoration-yellow-600 transition duration-300"
                >
                  Регистрирай се
                </Link>{" "}
                или{" "}
                <Link
                  href="/login"
                  className="text-yellow-500 font-bold hover:text-yellow-600 underline decoration-2 decoration-yellow-500 hover:decoration-yellow-600 transition duration-300"
                >
                  влез в профила си
                </Link>
              </>
            ),
          },
          { id: 2, text: "Намери или публикувай обява за пътуване" },
          { id: 3, text: "Пътувай удобно и изгодно!" },
        ].map((step) => (
          <div
            key={step.id}
            className="flex items-start space-x-6 transition-transform duration-500 hover:scale-105"
          >
            <div className="relative">
              <div className="bg-yellow-500 text-white rounded-full h-14 w-14 flex items-center justify-center text-lg font-bold shadow-lg">
                {step.id}
              </div>
              <div className="absolute -z-10 h-20 w-20 bg-yellow-400 rounded-full blur-2xl opacity-50 animate-bounce"></div>
            </div>
            <p className="text-xl leading-relaxed text-gray-700">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
