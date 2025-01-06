import { useSearchParams } from "react-router-dom";
import { db } from "../lib/firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth } from "../lib/firebase"; // Импортираме auth от Firebase
import { onAuthStateChanged } from "firebase/auth";

// Дефинираме интерфейси за типовете
interface Ad {
  start: string;
  end: string;
  date: string;
  seats: number;
  car?: string;
  description?: string;
  createdAt: any;
  stops?: string[];
}

interface User {
  name: string;
  rating: number;
  profilePicture?: string;
}

const OfferDetails = () => {
  const [ad, setAd] = useState<Ad | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [rating, setRating] = useState<number | null>(null); // Текущ рейтинг от потребителя
  const [hasRated, setHasRated] = useState<boolean>(false); // Дали потребителят вече е гласувал
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); // Съхраняваме текущия потребител
  const [hoveredRating, setHoveredRating] = useState<number | null>(null); // Съхраняваме рейтинга, върху който е мишката

  // Състояния за съобщенията
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const uid = searchParams.get("uid"); // Извличаме `uid` от URL параметрите

  // Използваме onAuthStateChanged за да следим промени в състоянието на автентикацията
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid); // Записваме UID на текущия потребител
      } else {
        setCurrentUserId(null); // Няма влезнал потребител
      }
    });

    return () => unsubscribe(); // Отписване от слушателя при излизане
  }, []);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);

        // Зареждаме обявата по нейното ID
        if (id) {
          const adDoc = await getDoc(doc(db, "ads", id));
          if (adDoc.exists()) {
            setAd(adDoc.data() as Ad);
          } else {
            setError("Обявата не съществува.");
          }
        }

        // Зареждаме данните за потребителя по неговото ID
        if (uid) {
          const userDoc = await getDoc(doc(db, "users", uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as User);

            // Проверка дали текущият потребител вече е гласувал
            if (currentUserId) {
              const q = query(
                collection(db, "ratings"),
                where("fromUserId", "==", currentUserId),
                where("toUserId", "==", uid)
              );
              const querySnapshot = await getDocs(q);
              if (!querySnapshot.empty) {
                setHasRated(true);
              }
            }
          } else {
            setError("Потребителят не съществува.");
          }
        }
      } catch (err) {
        console.error("Грешка при зареждане на данните:", err);
        setError("Неуспешно зареждане на данните.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, uid, currentUserId]); // Следим за промени в currentUserId

  const handleRating = async (value: number) => {
    // Проверка дали потребителят вече е гласувал
    if (hasRated || !uid || !currentUserId) {
      // Показваме съобщение за вече поставен рейтинг
      setErrorMessage("Вече сте гласували!");
      setTimeout(() => {
        setErrorMessage(null); // Скриваме съобщението след 3 секунди
      }, 3000);
      return;
    }

    try {
      // Запазване на рейтинга в базата
      await addDoc(collection(db, "ratings"), {
        fromUserId: currentUserId,
        toUserId: uid,
        rating: value,
      });

      // Обновяване на средния рейтинг
      const userRatingsQuery = query(
        collection(db, "ratings"),
        where("toUserId", "==", uid)
      );
      const ratingsSnapshot = await getDocs(userRatingsQuery);

      const ratings = ratingsSnapshot.docs.map((doc) => doc.data().rating);
      const averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;

      // Актуализираме локалния рейтинг
      if (user) {
        setUser((prevUser) => ({
          ...prevUser!,
          rating: averageRating, // Обновяваме рейтинга с новата стойност
        }));
      }

      setHasRated(true);
      setRating(value);

      // Показваме съобщение за успешен рейтинг
      setSuccessMessage("Рейтингът е записан успешно!");

      // Скриваме съобщението след 3 секунди
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Грешка при поставяне на рейтинг:", err);
      // Показваме съобщение за грешка, ако възникне нещо неочаквано
      setErrorMessage("Възникна грешка при записване на рейтинга.");
      setTimeout(() => {
        setErrorMessage(null); // Скриваме съобщението след 3 секунди
      }, 3000);
    }
  };

  if (loading) {
    return <p>Зареждане на обявата...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!ad) {
    return <p>Не намерихме обявата.</p>;
  }

  const formattedDate = ad.createdAt.toDate().toLocaleString("bg-BG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-white shadow-lg rounded-lg p-10 max-w-5xl mx-auto my-10 relative">
      <div className="absolute bottom-4 right-4 text-sm text-gray-500">
        Създадено на: {formattedDate}
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <h2 className="text-yellow-500 text-lg font-bold">Начална точка</h2>
          <p className="text-gray-800 mb-4">{ad.start}</p>
          {/* Останалите данни */}
          <h2 className="text-yellow-500 text-lg font-bold">Крайна точка</h2>
          <p className="text-gray-800 mb-4">{ad.end}</p>

          <h2 className="text-yellow-500 text-lg font-bold">
            Дата на пътуването
          </h2>
          <p className="text-gray-800 mb-4">{ad.date}</p>

          <h2 className="text-yellow-500 text-lg font-bold">Свободни места</h2>
          <p className="text-gray-800 mb-4">{ad.seats}</p>

          <h2 className="text-yellow-500 text-lg font-bold">Автомобил</h2>
          <p className="text-gray-800 mb-4">{ad.car || "Не е посочен"}</p>

          <h2 className="text-yellow-500 text-lg font-bold">Описание</h2>
          <p className="text-gray-800 mb-4">
            {ad.description || "Не е посочено"}
          </p>

          <h2 className="text-yellow-500 text-lg font-bold">Спирки</h2>
          <ul className="text-gray-800 list-disc ml-5">
            {ad.stops && ad.stops.length > 0
              ? ad.stops.map((stop, index) => (
                  <li key={index} className="mb-2">
                    {stop}
                  </li>
                ))
              : "Няма добавени спирки"}
          </ul>
        </div>

        <div className="flex-shrink-0 w-full lg:w-72 flex flex-col items-center bg-gray-50 p-6 rounded-lg shadow-md">
          {user ? (
            <>
              <div className="w-32 h-32 rounded-full border-2 border-yellow-500 flex items-center justify-center text-gray-500 text-6xl">
                👤
              </div>
              <h3 className="text-gray-800 text-xl font-bold mt-4">
                {user.name}
              </h3>
              <div className="flex items-center mt-2">
                {Array(5)
                  .fill(null)
                  .map((_, index) => (
                    <span
                      key={index}
                      className={`text-lg cursor-pointer ${
                        index < (hoveredRating ?? Math.round(user.rating))
                          ? "text-yellow-500"
                          : "text-gray-300"
                      }`}
                      onClick={() => handleRating(index + 1)}
                      onMouseEnter={() => setHoveredRating(index + 1)}
                      onMouseLeave={() => setHoveredRating(null)}
                    >
                      ★
                    </span>
                  ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Рейтинг: {user.rating.toFixed(1)}
              </p>
              {successMessage && (
                <p className="text-sm text-green-600 mt-2">{successMessage}</p>
              )}
              {errorMessage && (
                <p className="text-sm text-red-600 mt-2">{errorMessage}</p>
              )}
              <button className="mt-4 bg-green-500 text-white font-bold py-2 px-6 rounded-tr-xl rounded-bl-xl hover:bg-green-600 transition-all">
                Изпрати съобщение
              </button>
            </>
          ) : (
            <p className="text-gray-800 mb-4">
              Не можем да намерим информация за потребителя.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfferDetails;
