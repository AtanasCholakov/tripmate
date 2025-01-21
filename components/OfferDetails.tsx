"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { db } from "../lib/firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Firestore,
  serverTimestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  Star,
  MessageCircle,
  Car,
  Calendar,
  Users,
  MapPin,
} from "lucide-react";

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
  const [rating, setRating] = useState<number | null>(null);
  const [hasRated, setHasRated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const uid = searchParams.get("uid");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        setCurrentUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);

        if (id) {
          const adDocRef = doc(db as Firestore, "ads", id);
          const adDoc = await getDoc(adDocRef);
          if (adDoc.exists()) {
            setAd(adDoc.data() as Ad);
          } else {
            setError("Обявата не съществува.");
          }
        }

        if (uid) {
          const userDocRef = doc(db as Firestore, "users", uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUser(userDoc.data() as User);

            if (currentUserId) {
              const ratingsRef = collection(db, "ratings");
              const q = query(
                ratingsRef,
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
  }, [id, uid, currentUserId]);

  const handleRating = async (value: number) => {
    if (hasRated || !uid || !currentUserId) {
      return;
    }

    try {
      await addDoc(collection(db, "ratings"), {
        fromUserId: currentUserId,
        toUserId: uid,
        rating: value,
      });

      const userRatingsQuery = query(
        collection(db, "ratings"),
        where("toUserId", "==", uid)
      );
      const ratingsSnapshot = await getDocs(userRatingsQuery);

      const ratings = ratingsSnapshot.docs.map((doc) => doc.data().rating);
      const averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;

      if (user) {
        setUser((prevUser) => ({
          ...prevUser!,
          rating: averageRating,
        }));
      }

      setHasRated(true);
      setRating(value);
    } catch (err) {
      console.error("Грешка при поставяне на рейтинг:", err);
    }
  };

  const handleStartChat = async () => {
    if (!currentUserId || !uid) return;

    try {
      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("participants", "array-contains", currentUserId)
      );
      const querySnapshot = await getDocs(q);

      let existingChatId = null;
      querySnapshot.forEach((doc) => {
        const chatData = doc.data();
        if (chatData.participants.includes(uid)) {
          existingChatId = doc.id;
        }
      });

      if (existingChatId) {
        router.push(`/chat?userId=${uid}`);
      } else {
        router.push(`/chat?userId=${uid}`);
      }
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="relative w-40 h-2 bg-gray-300 rounded-full">
          <div className="absolute top-0 left-0 h-full bg-green-500 rounded-full animate-progressBar"></div>
        </div>
        <p className="ml-4 text-xl font-bold text-gray-600">
          Зареждане на обявите...
        </p>
      </div>
    );
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
              <button
                className="mt-4 bg-green-500 text-white font-bold py-2 px-6 rounded-full hover:bg-green-600 transition-all flex items-center justify-center"
                onClick={handleStartChat}
              >
                <MessageCircle className="mr-2" />
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
