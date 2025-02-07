"use client";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import OfferCard from "@/components/OfferCard";
import OfferDetails from "@/components/OfferDetails";
import { db, auth } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import type { User } from "firebase/auth";

function Page() {
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Проверяваме дали съобщението вече е показано
        const verificationShown = localStorage.getItem("verificationShown");
        if (user.emailVerified && verificationShown !== "true") {
          setShowVerificationSuccess(true);
          localStorage.setItem("verificationShown", "true");

          setTimeout(() => setShowVerificationSuccess(false), 5000);
        }
      }
      setIsAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  if (!isAuthChecked) {
    return null; // or a loading spinner if preferred
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <AnimatePresence>
          {showVerificationSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg border border-green-500 p-4 z-50 flex items-center space-x-4 max-w-md"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2l4 -4m0 -5a9 9 0 1 1 -18 0a9 9 0 0 1 18 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-green-500 font-semibold">
                  Вашият имейл е успешно верифициран!
                </h3>
                <p className="text-gray-600 text-sm">
                  Благодарим Ви! Вече можете да използвате всички функции на
                  TripMate.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Hero />
                <HomePageContent />
              </>
            }
          />
          <Route path="/offer-details" element={<OfferDetails />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

function HomePageContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [topAds, setTopAds] = useState<Ad[]>([]);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  interface Ad {
    id: string;
    start: string;
    end: string;
    date: string;
    seats: number;
    userId: string;
    car: string;
    description: string;
    userRating: number;
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
      setIsLoggedIn(!!user);
      setIsAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchTopAds = async () => {
      try {
        const adSnapshot = await getDocs(collection(db, "ads"));
        const adList: Ad[] = [];

        for (const doc of adSnapshot.docs) {
          const adData = doc.data();
          const ad: Ad = {
            id: doc.id,
            start: adData.start,
            end: adData.end,
            date: adData.date,
            seats: adData.seats,
            userId: adData.userId,
            car: adData.car || "",
            description: adData.description || "",
            userRating: 0, // Initialize userRating here
          };
          adList.push(ad);
        }

        const userSnapshot = await getDocs(collection(db, "users"));
        const userRatings: { [key: string]: number } = {};

        for (const userDoc of userSnapshot.docs) {
          const userData = userDoc.data();
          const userId = userDoc.id;
          const rating = userData.rating || 0;
          userRatings[userId] = rating;
        }

        const adsWithRatings = adList.map((ad) => ({
          ...ad,
          userRating: userRatings[ad.userId] || 0,
        }));

        const sortedAds = adsWithRatings
          .sort((a, b) => b.userRating - a.userRating)
          .slice(0, 3);

        setTopAds(sortedAds as Ad[]);
      } catch (error) {
        console.error("Грешка при зареждане на данните:", error);
      }
    };

    fetchTopAds();
  }, []);

  if (!isAuthChecked) {
    return null; // or a loading spinner if preferred
  }

  return (
    <>
      {!isLoggedIn && (
        <section className="py-10 bg-white">
          <h2 className="text-center text-3xl font-bold text-gray-800">
            Готови за път? Виж най-добрите оферти!
          </h2>
          <div className="flex justify-center gap-8 mt-8 px-4">
            {topAds.length > 0 ? (
              topAds.map((ad) => (
                <OfferCard
                  key={ad.id}
                  docId={ad.id}
                  id={ad.userId}
                  start={ad.start}
                  end={ad.end}
                  date={ad.date}
                  seats={ad.seats}
                  car={ad.car}
                  description={ad.description}
                />
              ))
            ) : (
              <p>Няма налични обяви с най-висок рейтинг.</p>
            )}
          </div>
        </section>
      )}
      {!isLoggedIn && <HowItWorks />}
    </>
  );
}

export default Page;
