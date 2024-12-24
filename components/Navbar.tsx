"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { auth } from "../lib/firebase"; // Възможно е да се наложи да добавиш пътя към конфигурацията на Firebase
import { onAuthStateChanged, signOut } from "firebase/auth";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Начално състояние - потребителят не е влязъл
  const [menuOpen, setMenuOpen] = useState(false);

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

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = async () => {
    console.log("Logging out...");
    await signOut(auth); // Изход от Firebase
    setIsLoggedIn(false); // Актуализиране на състоянието
  };

  return (
    <>
      {/* Navbar */}
      <nav className="bg-yellow-500 p-4 flex justify-between items-center fixed top-0 left-0 w-full z-50 shadow-xl transition-all ease-in-out duration-300">
        <Link href="/">
          <img
            src="/images/logo.png"
            alt="TripMate Logo"
            className="h-20 w-auto transform transition-transform duration-300 hover:scale-110 hover:ring-4 hover:ring-yellow-500"
          />
        </Link>

        <div className="relative flex items-center">
          {isLoggedIn ? (
            <div className="relative">
              {/* Профилна снимка */}
              <img
                src="/images/menu.png" // Може да замените с динамична снимка на потребителя
                alt="Profile"
                className="h-12 w-12 shadow-lg cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={toggleMenu}
              />

              {/* Меню за профил */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl w-48 p-2 transform transition-transform duration-300 scale-100 origin-top-right">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-200 rounded-md text-lg font-semibold"
                  >
                    Преглед на профил
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-200 rounded-md text-lg font-semibold"
                  >
                    Изход
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-4">
              <Link href="/login">
                <button className="bg-white text-yellow-500 px-6 py-2 rounded-bl-xl rounded-tr-xl mt-4 text-lg font-bold hover:bg-yellow-100 transition duration-300 flex items-center">
                  Вход
                </button>
              </Link>
              <Link href="/register">
                <button className="bg-green-500 text-white px-6 py-2 rounded-bl-xl rounded-tr-xl mt-4 text-lg font-bold hover:bg-green-600 transition duration-300 flex items-center">
                  Регистрация
                </button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Основно съдържание */}
      <div className="pt-24">
        {" "}
        <main></main>
      </div>
    </>
  );
};

export default Navbar;
