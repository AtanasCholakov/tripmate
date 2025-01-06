import { useState } from "react";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import OfferCard from "./OfferCard";
import CITIES from "@/lib/cities";

const SearchAdForm = () => {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [date, setDate] = useState("");
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAds();
    setIsSearching(false); // Скриване на формата след търсене
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
