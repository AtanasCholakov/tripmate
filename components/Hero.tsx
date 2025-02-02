"use client";

import { useState, useEffect } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import CreateAdForm from "@/components/CreateAdForm";
import SearchAdForm from "@/components/SearchAdForm";
import Link from "next/link";
import { motion } from "framer-motion";

const Hero = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeSection, setActiveSection] = useState("search");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setActiveSection("search");
      } else {
        setIsLoggedIn(false);
        setActiveSection("none");
      }
    });

    return () => unsubscribe();
  }, []);

  const renderActiveSection = () => {
    if (activeSection === "create") {
      return <CreateAdForm />;
    } else if (activeSection === "search") {
      return <SearchAdForm />;
    }
    return null;
  };

  return (
    <div className="bg-white">
      {!isLoggedIn ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative h-[600px] bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero-image.png')" }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-center text-white">
            <motion.h1
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-6xl font-bold mb-4"
            >
              TripMate
            </motion.h1>
            <motion.p
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-2xl mb-8"
            >
              Сподели пътя, намали емисиите!
            </motion.p>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Link href="/register">
                <button className="bg-green-500 text-white px-8 py-3 rounded-full text-xl font-bold hover:bg-green-600 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50">
                  Започни сега →
                </button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <div className="container mx-auto px-4 py-8 mt-3">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center gap-4 mb-8"
          >
            <button
              className={`px-6 py-3 rounded-full text-lg font-bold transition duration-300 ${
                activeSection === "search"
                  ? "bg-green-500 text-white"
                  : "bg-white text-green-500 hover:bg-green-100"
              }`}
              onClick={() => setActiveSection("search")}
            >
              Търсене на обява
            </button>
            <button
              className={`px-6 py-3 rounded-full text-lg font-bold transition duration-300 ${
                activeSection === "create"
                  ? "bg-green-500 text-white"
                  : "bg-white text-green-500 hover:bg-green-100"
              }`}
              onClick={() => setActiveSection("create")}
            >
              Създаване на обява
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {renderActiveSection()}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Hero;
