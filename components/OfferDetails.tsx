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
  type Firestore,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { MessageCircle, Car, Calendar, Users, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

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
  const [ratingMessage, setRatingMessage] = useState<string | null>(null);

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
      setRatingMessage("Вече сте гласували");
      setTimeout(() => setRatingMessage(null), 2000);
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
      setRatingMessage("Гласът ви е записан");
      setTimeout(() => setRatingMessage(null), 2000);
    } catch (err) {
      console.error("Грешка при поставяне на рейтинг:", err);
      setRatingMessage("Грешка при гласуване");
      setTimeout(() => setRatingMessage(null), 2000);
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
    <div className="bg-white shadow-lg rounded-lg p-10 max-w-5xl mx-auto my-10 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-0 left-0 w-full h-2 bg-green-500"
      />
      <div className="absolute bottom-4 right-4 text-sm text-gray-500 z-10">
        Създадено на: {formattedDate}
      </div>
      <div className="flex flex-col lg:flex-row gap-8 relative z-20">
        <div className="flex-1">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-yellow-500 text-2xl font-bold mb-6"
          >
            Детайли за пътуването
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-50 p-6 rounded-lg shadow-md mb-6"
          >
            <div className="flex items-center mb-4">
              <MapPin className="text-green-500 mr-2" />
              <h3 className="text-lg font-semibold">Начална и крайна точка</h3>
            </div>
            <p className="text-gray-800 mb-2">От: {ad.start}</p>
            <p className="text-gray-800">До: {ad.end}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gray-50 p-6 rounded-lg shadow-md mb-6"
          >
            <div className="flex items-center mb-4">
              <Calendar className="text-green-500 mr-2" />
              <h3 className="text-lg font-semibold">Дата на пътуването</h3>
            </div>
            <p className="text-gray-800">{ad.date}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gray-50 p-6 rounded-lg shadow-md mb-6"
          >
            <div className="flex items-center mb-4">
              <Users className="text-green-500 mr-2" />
              <h3 className="text-lg font-semibold">Свободни места</h3>
            </div>
            <p className="text-gray-800">{ad.seats}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-gray-50 p-6 rounded-lg shadow-md mb-6"
          >
            <div className="flex items-center mb-4">
              <Car className="text-green-500 mr-2" />
              <h3 className="text-lg font-semibold">Автомобил</h3>
            </div>
            <p className="text-gray-800">{ad.car || "Не е посочен"}</p>
          </motion.div>

          {ad.description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-gray-50 p-6 rounded-lg shadow-md mb-6"
            >
              <h3 className="text-lg font-semibold mb-2">Описание</h3>
              <p className="text-gray-800">{ad.description}</p>
            </motion.div>
          )}

          {ad.stops && ad.stops.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="bg-gray-50 p-6 rounded-lg shadow-md"
            >
              <h3 className="text-lg font-semibold mb-2">Спирки</h3>
              <ul className="text-gray-800 list-disc ml-5">
                {ad.stops.map((stop, index) => (
                  <li key={index} className="mb-2">
                    {stop}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>

        <div className="flex-shrink-0 w-full lg:w-72 flex flex-col items-center bg-gray-50 p-6 rounded-lg shadow-md">
          {user ? (
            <>
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-32 h-32 rounded-full border-2 border-yellow-500 flex items-center justify-center text-gray-500 text-6xl overflow-hidden"
              >
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture || "/placeholder.svg"}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>👤</span>
                )}
              </motion.div>
              <motion.h3
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-gray-800 text-xl font-bold mt-4"
              >
                {user.name}
              </motion.h3>
              <div className="flex items-center mt-2 relative">
                {Array(5)
                  .fill(null)
                  .map((_, index) => (
                    <motion.span
                      key={index}
                      className={`text-2xl cursor-pointer ${
                        index < (hoveredRating ?? Math.round(user.rating))
                          ? "text-yellow-500"
                          : "text-gray-300"
                      }`}
                      onClick={() => handleRating(index + 1)}
                      onMouseEnter={() => setHoveredRating(index + 1)}
                      onMouseLeave={() => setHoveredRating(null)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ★
                    </motion.span>
                  ))}
                <AnimatePresence>
                  {ratingMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute -bottom-8 left-0 right-0 text-center text-sm text-green-500 bg-white px-2 py-1 rounded-full shadow-md"
                    >
                      {ratingMessage}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Рейтинг: {user.rating.toFixed(1)}
              </p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="w-full space-y-4 mt-4"
              >
                <motion.button
                  className="w-full relative overflow-hidden group bg-green-500 text-white font-bold py-2 px-6 rounded-full transition-all duration-300"
                  onClick={handleStartChat}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    <MessageCircle className="mr-2" />
                    Изпрати съобщение
                  </span>
                  <span className="absolute inset-0 bg-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></span>
                </motion.button>

                <Link
                  href={`/user/${uid}`}
                  className="w-full inline-block relative overflow-hidden group bg-yellow-500 text-white font-bold py-2 px-6 rounded-full transition-all duration-300 text-center"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Виж профила
                  </span>
                  <span className="absolute inset-0 bg-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></span>
                </Link>
              </motion.div>
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
