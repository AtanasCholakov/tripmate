"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { User, LogOut, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        setIsAdmin(userData?.username === "admin");
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
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
    setIsAdmin(false);
  };

  return (
    <>
      <nav className="bg-yellow-500 p-4 flex justify-between items-center fixed top-0 left-0 w-full z-50 shadow-xl transition-all ease-in-out duration-300">
        <button onClick={() => (window.location.href = "/")}>
          <motion.img
            src="/images/logo.png"
            alt="TripMate Logo"
            className="h-20 w-auto"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          />
        </button>

        <div className="relative flex items-center">
          {isLoggedIn ? (
            <div className="flex items-center space-x-6">
              {isAdmin && (
                <Link href="/admin">
                  <motion.button
                    className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Settings size={24} />
                  </motion.button>
                </Link>
              )}
              <motion.div
                className="relative"
                initial={false}
                animate={menuOpen ? "open" : "closed"}
              >
                <motion.img
                  src="/images/menu.png"
                  alt="Profile"
                  className="h-11 w-11 shadow-lg cursor-pointer"
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
