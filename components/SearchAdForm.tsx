"use client";

import { useState } from "react";
import OfferCard from "./OfferCard";
import CITIES from "@/lib/cities";

const SearchAdForm = () => {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [date, setDate] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(true);

  // Фиктивни данни за обявите
  const ads = [
    { start: "София", end: "Пловдив", date: "2024-12-25", seats: 3 },
    { start: "Варна", end: "Бургас", date: "2024-12-26", seats: 2 },
    { start: "София", end: "Бургас", date: "2024-12-27", seats: 4 },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Филтриране на обявите
    const filteredAds = ads.filter(
      (ad) =>
        (!start || ad.start.toLowerCase().includes(start.toLowerCase())) &&
        (!end || ad.end.toLowerCase().includes(end.toLowerCase())) &&
        (!date || ad.date === date)
    );

    setResults(filteredAds);
    setIsSearching(false); // Скриване на формата
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
      ) : results.length > 0 ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">Намерени обяви:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((ad, index) => (
              <OfferCard
                key={index}
                start={ad.start}
                end={ad.end}
                date={ad.date}
                seats={ad.seats}
              />
            ))}
          </div>
          <button
            className="mt-6 bg-green-500 text-white px-20 py-2 mx-auto rounded-bl-xl rounded-tr-xl text-lg font-bold hover:bg-green-600 transition duration-300"
            onClick={() => setIsSearching(true)}
          >
            ← Назад към търсенето
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-4">Няма намерени обяви.</h2>
          <button
            className="mt-6 bg-green-500 text-white px-20 py-2 mx-auto rounded-bl-xl rounded-tr-xl text-lg font-bold hover:bg-green-600 transition duration-300"
            onClick={() => setIsSearching(true)}
          >
            ← Назад към търсенето
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchAdForm;
