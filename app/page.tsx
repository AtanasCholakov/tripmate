"use client";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react"; // Импортирайте useEffect и useState
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import OfferCard from "@/components/OfferCard";
import OfferDetails from "@/components/OfferDetails";
import { db, auth } from "../lib/firebase"; // Импортирайте auth и db от firebase
import { collection, getDocs } from "firebase/firestore"; // Firebase функции

function Page() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <Routes>
          {/* Главната страница */}
          <Route
            path="/"
            element={
              <>
                <Hero />
                <HomePageContent />
              </>
            }
          />
          {/* Страница за детайли на обява */}
          <Route path="/offer-details" element={<OfferDetails />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

function HomePageContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [topAds, setTopAds] = useState<any[]>([]); // Състояние за топ обяви

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: any) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchTopAds = async () => {
      try {
        // Извличане на всички обяви
        const adSnapshot = await getDocs(collection(db, "ads"));
        const adList: any[] = [];

        // Преглеждаме всички обяви и добавяме информацията за тях
        for (const doc of adSnapshot.docs) {
          const adData = doc.data();
          const ad = {
            id: doc.id, // Добавяме ID на обявата
            start: adData.start,
            end: adData.end,
            date: adData.date,
            seats: adData.seats,
            userId: adData.userId,
          };
          adList.push(ad);
        }

        // Извличаме потребителите и техните рейтинги
        const userSnapshot = await getDocs(collection(db, "users"));
        const userRatings: { [key: string]: number } = {};

        for (const userDoc of userSnapshot.docs) {
          const userData = userDoc.data();
          const userId = userDoc.id;
          const rating = userData.rating || 0; // Ако няма рейтинг, задаваме 0
          userRatings[userId] = rating;
        }

        // Свързваме обявите с рейтинга на потребителите
        const adsWithRatings = adList.map((ad) => ({
          ...ad,
          userRating: userRatings[ad.userId] || 0, // Добавяме рейтинга
        }));

        // Сортираме обявите по рейтинг и избираме топ 3
        const topThreeAds = adsWithRatings
          .sort((a, b) => b.userRating - a.userRating) // Сортиране по рейтинг
          .slice(0, 3); // Вземаме първите 3 обяви

        setTopAds(topThreeAds); // Задаваме топ обяви
      } catch (error) {
        console.error("Грешка при зареждане на данните:", error);
      }
    };

    fetchTopAds();
  }, []);

  return (
    <>
      {!isLoggedIn && ( // Показва секцията само ако потребителят НЕ е влязъл
        <section className="py-10 bg-gray-100">
          <h2 className="text-center text-3xl font-bold text-gray-800">
            Готови за път? Виж най-добрите оферти!
          </h2>
          <div className="flex justify-center gap-8 mt-8 px-4">
            {topAds.length > 0 ? (
              topAds.map((ad) => (
                <OfferCard
                  key={ad.id} // Използваме ID на обявата
                  start={ad.start}
                  end={ad.end}
                  date={ad.date}
                  seats={ad.seats}
                />
              ))
            ) : (
              <p>Няма налични обяви с най-висок рейтинг.</p>
            )}
          </div>
        </section>
      )}
      {!isLoggedIn && <HowItWorks />}{" "}
      {/* Показваме HowItWorks ако потребителят не е влязъл */}
    </>
  );
}

export default Page;
