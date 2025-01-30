"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { MessageCircle, Bell, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(3); // Example state for unread messages

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = async () => {
    console.log("Logging out...");
    await signOut(auth);
    setIsLoggedIn(false);
  };

  return (
    <>
      <nav className="bg-yellow-500 p-4 flex justify-between items-center fixed top-0 left-0 w-full z-50 shadow-xl transition-all ease-in-out duration-300">
        <Link href="/">
          <motion.img
            src="/images/logo.png"
            alt="TripMate Logo"
            className="h-20 w-auto"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          />
        </Link>

        <div className="relative flex items-center">
          {isLoggedIn ? (
            <div className="flex items-center space-x-6">
              <Link href="/chat">
                <motion.button
                  className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors relative"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MessageCircle size={24} />
                  {unreadMessages > 0 && (
                    <motion.span
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    >
                      {unreadMessages}
                    </motion.span>
                  )}
                </motion.button>
              </Link>
              <motion.div
                className="relative"
                initial={false}
                animate={menuOpen ? "open" : "closed"}
              >
                <motion.img
                  src="/images/menu.png"
                  alt="Profile"
                  className="h-12 w-12 shadow-lg cursor-pointer"
                  onClick={toggleMenu}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                />
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl w-48 overflow-hidden"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    >
                      <Link href="/profile">
                        <motion.div
                          className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100"
                          whileHover={{ x: 5 }}
                        >
                          <User size={18} className="mr-2" />
                          <span>Преглед на профил</span>
                        </motion.div>
                      </Link>
                      <motion.div
                        className="flex items-center px-4 py-2 text-red-600 hover:bg-gray-100 cursor-pointer"
                        onClick={handleLogout}
                        whileHover={{ x: 5 }}
                      >
                        <LogOut size={18} className="mr-2" />
                        <span>Изход</span>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link href="/login">
                <motion.button
                  className="bg-white text-yellow-500 px-6 py-2 rounded-bl-xl rounded-tr-xl text-lg font-bold hover:bg-yellow-100 transition duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Вход
                </motion.button>
              </Link>
              <Link href="/register">
                <motion.button
                  className="bg-green-500 text-white px-6 py-2 rounded-bl-xl rounded-tr-xl text-lg font-bold hover:bg-green-600 transition duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Регистрация
                </motion.button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      <div className="pt-24">
        <main></main>
      </div>
    </>
  );
};

export default Navbar;
