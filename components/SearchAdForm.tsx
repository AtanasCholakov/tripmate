"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  getDoc,
  doc,
} from "firebase/firestore";
import OfferCard from "./OfferCard";
import CITIES from "@/lib/cities";
import { motion } from "framer-motion";

const SearchAdForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [date, setDate] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [topRatedAds, setTopRatedAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const savedSearch = JSON.parse(localStorage.getItem("savedSearch") || "{}");
    if (savedSearch.start) setStart(savedSearch.start);
    if (savedSearch.end) setEnd(savedSearch.end);
    if (savedSearch.date) setDate(savedSearch.date);
    if (Object.keys(savedSearch).length > 0) {
      setHasSearched(true);
      fetchAds(savedSearch);
    } else {
      fetchTopRatedAds();
    }
  }, []);

  const fetchTopRatedAds = async () => {
    try {
      const adsRef = collection(db, "ads");
      const q = query(adsRef, limit(9));
      const querySnapshot = await getDocs(q);

      const adsWithUserRatings = await Promise.all(
        querySnapshot.docs.map(async (adDoc) => {
          const adData = adDoc.data();
          const userDoc = await getDoc(doc(db, "users", adData.userId));
          const userData = userDoc.data();
          return {
            id: adDoc.id,
            ...adData,
            userRating: userData?.rating || 0,
          };
        })
      );

      const sortedAds = adsWithUserRatings
        .sort((a, b) => b.userRating - a.userRating)
        .slice(0, 3);

      setTopRatedAds(sortedAds);
    } catch (error) {
      console.error("Error fetching top rated ads:", error);
    }
  };

  const fetchAds = async (searchParams: {
    start?: string;
    end?: string;
    date?: string;
  }) => {
    setLoading(true);
    try {
      const adsRef = collection(db, "ads");
      const constraints = [];

      if (searchParams.start)
        constraints.push(
          where("startLower", "==", searchParams.start.toLowerCase())
        );
      if (searchParams.end)
        constraints.push(
          where("endLower", "==", searchParams.end.toLowerCase())
        );
      if (searchParams.date)
        constraints.push(where("date", "==", searchParams.date));

      const q = query(adsRef, ...constraints);
      const querySnapshot = await getDocs(q);

      const adsWithUserRatings = await Promise.all(
        querySnapshot.docs.map(async (adDoc) => {
          const adData = adDoc.data();
          const userDoc = await getDoc(doc(db, "users", adData.userId));
          const userData = userDoc.data();
          return {
            id: adDoc.id,
            ...adData,
            userRating: userData?.rating || 0,
          };
        })
      );

      const sortedAds = adsWithUserRatings.sort(
        (a, b) => b.userRating - a.userRating
      );

      setResults(sortedAds);
      setTotalPages(Math.ceil(sortedAds.length / 6));
    } catch (error) {
      console.error("Error fetching ads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const searchParams = { start, end, date };
    localStorage.setItem("savedSearch", JSON.stringify(searchParams));
    fetchAds(searchParams);
  };

  const paginatedResults = results.slice(
    (currentPage - 1) * 6,
    currentPage * 6
  );

  return (
    <div className="p-10 mx-auto max-w-7xl bg-white shadow-lg rounded-lg">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-green-600">
          Търсене на обява
        </h2>
        <form
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          onSubmit={handleSearch}
        >
          <div>
            <input
              list="cities"
              type="text"
              placeholder="Начална точка"
              className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-green-500 transition duration-300"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
            <datalist id="cities">
              {CITIES.map((city, index) => (
                <option key={index} value={city} />
              ))}
            </datalist>
          </div>
          <div>
            <input
              list="cities"
              type="text"
              placeholder="Крайна точка"
              className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-green-500 transition duration-300"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
          <div>
            <input
              type="date"
              className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-green-500 transition duration-300"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="md:col-span-3">
            <button
              type="submit"
              className="w-full p-3 text-lg font-bold text-white bg-green-500 rounded-lg transition duration-300 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 relative overflow-hidden group"
            >
              <span className="relative z-10">Търси</span>
              <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-30 transform scale-0 group-hover:scale-150 transition-all duration-500 ease-out"></span>
              <span className="absolute bottom-0 left-0 w-full h-1 bg-green-300 transform scale-x-0 group-hover:scale-x-100 transition-all duration-500 ease-in-out"></span>
            </button>
          </div>
        </form>
      </motion.div>

      {!hasSearched && topRatedAds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold mb-4 text-center text-green-600">
            Топ обяви
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {topRatedAds.map((ad) => (
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
            ))}
          </div>
        </motion.div>
      )}

      {hasSearched && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16"
        >
          {loading ? (
            <div className="text-center py-10">
              <p className="text-xl font-bold text-gray-600">
                Зареждане на обявите...
              </p>
            </div>
          ) : results.length > 0 ? (
            <>
              <h3 className="text-2xl font-bold mb-6 text-center text-yellow-500">
                Намерени обяви
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {paginatedResults.map((ad) => (
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
                ))}
              </div>
              <div className="flex justify-center mt-8 space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === page
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      } transition duration-300`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-10 mt-16">
              <p className="text-xl font-bold text-gray-600">
                Няма намерени обяви.
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default SearchAdForm;
