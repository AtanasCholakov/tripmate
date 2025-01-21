"use client";

import { useState, useEffect } from "react";
import { auth } from "../lib/firebase"; // Уверете се, че е правилният път
import { onAuthStateChanged } from "firebase/auth";
import CreateAdForm from "@/components/CreateAdForm";
import SearchAdForm from "@/components/SearchAdForm";
import Link from "next/link";

const Hero = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeSection, setActiveSection] = useState("none"); // Управление на активната секция

  useEffect(() => {
    // Проверка дали потребителят е влязъл
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true); // Потребителят е влязъл
      } else {
        setIsLoggedIn(false); // Потребителят не е влязъл
      }
    });

    // Почисти подписката при демонтиране на компонента
    return () => unsubscribe();
  }, []);

  const renderActiveSection = () => {
    if (activeSection === "create") {
      return <CreateAdForm />;
    } else if (activeSection === "search") {
      return <SearchAdForm />;
    }
    return null; // Ако няма активна секция, нищо не се показва
  };

  return (
    <div>
      {!isLoggedIn ? (
        <div
          className="relative h-[400px] bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero-image.png')" }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-center items-center text-center text-white">
            <h1 className="text-4xl font-bold">TripMate</h1>
            <p className="text-xl mt-2">Сподели пътя, намали емисиите!</p>
            <Link href="/register">
              <button className="relative bg-green-500 text-white px-6 py-2 rounded-bl-xl rounded-tr-xl mt-4 text-lg font-bold overflow-hidden group">
                <span className="relative z-10">Започни сега →</span>
                <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-30 transform scale-0 group-hover:scale-150 transition-all duration-500 ease-out"></span>
                <span className="absolute bottom-0 left-0 w-full h-1 bg-green-300 transform scale-x-0 group-hover:scale-x-100 transition-all duration-500 ease-in-out"></span>
                <span className="absolute top-0 left-0 w-full h-full bg-green-500 opacity-20 group-hover:opacity-0 transition-all duration-500 ease-in-out"></span>
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-5">
          <div className="flex justify-center gap-4 mb-8 mt-5">
            <button
              className="bg-green-500 text-white px-6 py-2 rounded-bl-xl rounded-tr-xl text-lg font-bold hover:bg-green-600 transition duration-300"
              onClick={() => setActiveSection("search")}
            >
              Търсене на обява
            </button>
            <button
              className="bg-white text-black px-6 py-2 rounded-bl-xl rounded-tr-xl text-lg font-bold hover:bg-gray-100 transition duration-300 border border-black"
              onClick={() => setActiveSection("create")}
            >
              Създаване на обява
            </button>
          </div>

          <div className="mt-8">{renderActiveSection()}</div>
        </div>
      )}
    </div>
  );
};

export default Hero;
