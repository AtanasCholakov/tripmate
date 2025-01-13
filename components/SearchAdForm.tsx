"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import OfferCard from "./OfferCard";
import CITIES from "@/lib/cities";

const SearchAdForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [start, setStart] = useState(searchParams.get("start") || "");
  const [end, setEnd] = useState(searchParams.get("end") || "");
  const [date, setDate] = useState(searchParams.get("date") || "");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const adsRef = collection(db, "ads");
      const constraints = [];

      // Преобразуваме началната и крайната точка в малки букви за търсене
      if (start)
        constraints.push(where("startLower", "==", start.toLowerCase()));
      if (end) constraints.push(where("endLower", "==", end.toLowerCase()));
      if (date) constraints.push(where("date", "==", date));

      const q = query(adsRef, ...constraints);
      const querySnapshot = await getDocs(q);

      const ads = querySnapshot.docs.map((doc) => ({
        id: doc.id, // Извличане на уникалното ID на документа
        ...doc.data(), // Добавяне на данните от документа
      }));
      setResults(ads);
    } catch (error) {
      console.error("Error fetching ads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSearching) fetchAds();
  }, [start, end, date]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Добавяне на параметрите за търсене в URL
    router.push(
      `/?start=${encodeURIComponent(start)}&end=${encodeURIComponent(
        end
      )}&date=${encodeURIComponent(date)}`
    );

    fetchAds();
    setIsSearching(false);
  };

  return (
    <div className="p-10 mx-20 mb-20 bg-white shadow rounded-lg">
      {isSearching ? (
        <>
          <h2 className="text-2xl font-bold mb-4">Търсене на обява</h2>
          <form className="grid grid-cols-2 gap-4" onSubmit={handleSearch}>
            <div>
              <input
                list="cities"
                type="text"
                placeholder="Начална точка"
                className="p-2 border rounded w-full"
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
                className="p-2 border rounded w-full"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
              <datalist id="cities">
                {CITIES.map((city, index) => (
                  <option key={index} value={city} />
                ))}
              </datalist>
            </div>
            <input
              type="date"
              className="p-2 border rounded"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <button
              type="submit"
              className="bg-green-500 text-white px-20 py-2 mx-auto rounded-bl-xl rounded-tr-xl text-lg font-bold hover:bg-green-600 transition duration-300 col-span-2"
            >
              Търси
            </button>
          </form>
        </>
      ) : loading ? (
        <div className="text-center py-10">
          <p className="text-xl font-bold text-gray-600">
            Зареждане на обявите...
          </p>
        </div>
      ) : results.length > 0 ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">Намерени обяви:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((ad) => (
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
          <button
            className="mt-6 px-20 py-2 mx-auto rounded-bl-xl rounded-tr-xl text-lg font-bold text-white relative overflow-hidden bg-green-500 hover:bg-green-600 transition-all duration-300 transform hover:scale-105 group"
            onClick={() => setIsSearching(true)}
          >
            <span className="z-10 relative">← Назад към търсенето</span>
            <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-30 transform scale-0 group-hover:scale-150 transition-all duration-500 ease-out"></span>
            <span className="absolute bottom-0 left-0 w-full h-1 bg-green-300 transform scale-x-0 group-hover:scale-x-100 transition-all duration-500 ease-in-out"></span>
            <span className="absolute top-0 left-0 w-full h-full bg-green-500 opacity-20 group-hover:opacity-0 transition-all duration-500 ease-in-out"></span>
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-4">Няма намерени обяви.</h2>
          <button
            className="mt-6 bg-green-500 text-white px-20 py-2 mx-auto rounded-bl-xl rounded-tr-xl text-lg font-bold hover:bg-green-600 transition duration-300 relative overflow-hidden group"
            onClick={() => setIsSearching(true)}
          >
            <span className="z-10">← Назад към търсенето</span>
            <span className="absolute inset-0 bg-white opacity-20 transform scale-x-0 group-hover:scale-x-100 transition-all duration-500 origin-right"></span>
            <span className="absolute left-0 -translate-x-full group-hover:translate-x-0 transition-all duration-300 ease-in-out">
              ➔
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchAdForm;
