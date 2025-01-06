"use client";

import { useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserProfile {
  uid: string; // добавено uid
  name: string;
  email: string;
  profilePicture?: string;
  username: string;
  rating: number;
  votes: number;
  createdAt: string;
}

interface OfferCardProps {
  docId: string;
  id: string;
  start: string;
  end: string;
  date: string;
  seats: number;
  car?: string;
  description?: string;
}

const RatingComponent = ({
  rating,
  votes,
}: {
  rating: number;
  votes: number;
}) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;

  return (
    <div className="flex items-center space-x-2">
      {[...Array(fullStars)].map((_, index) => (
        <span key={index} className="text-yellow-400 text-2xl">
          ★
        </span>
      ))}
      {halfStar === 1 && <span className="text-yellow-400 text-2xl">☆</span>}
      {[...Array(emptyStars)].map((_, index) => (
        <span
          key={index + fullStars + halfStar}
          className="text-gray-300 text-2xl"
        >
          ☆
        </span>
      ))}
      <span className="text-gray-600 text-base">({votes} гласа)</span>
    </div>
  );
};

const ProfilePage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<"profile" | "ads">("profile");
  const [userAds, setUserAds] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async (uid: string) => {
      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const ratingsQuery = query(
            collection(db, "ratings"),
            where("toUserId", "==", uid)
          );
          const ratingsSnapshot = await getDocs(ratingsQuery);
          const totalVotes = ratingsSnapshot.size;
          const totalRating = ratingsSnapshot.docs.reduce(
            (sum, doc) => sum + doc.data().rating,
            0
          );
          const averageRating = totalVotes > 0 ? totalRating / totalVotes : 0;

          setUser({
            uid: uid, // добавяме uid тук
            name: userData.name,
            email: userData.email,
            username: userData.username,
            profilePicture: userData.profilePicture,
            rating: averageRating,
            votes: totalVotes,
            createdAt: new Date(
              userData.createdAt.seconds * 1000
            ).toLocaleDateString("bg-BG", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          });
        } else {
          setError("Не намерихме данни за този потребител.");
        }
      } catch (err) {
        console.error(err);
        setError("Неуспешно зареждане на данните за потребителя.");
      } finally {
        setLoading(false);
      }
    };

    const fetchUserAds = async (uid: string) => {
      try {
        const adsQuery = query(
          collection(db, "ads"),
          where("userId", "==", uid)
        );
        const adsSnapshot = await getDocs(adsQuery);
        setUserAds(
          adsSnapshot.docs.map((doc) => ({ docId: doc.id, ...doc.data() }))
        );
      } catch (err) {
        console.error(err);
        setError("Неуспешно зареждане на обявите.");
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        fetchUserData(currentUser.uid);
        fetchUserAds(currentUser.uid);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleEdit = () => router.push("/profile/edit");

  if (loading)
    return <p className="text-center mt-10">Зареждане на профила...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!user)
    return <p className="text-center mt-10">Не сте влезли в профила си.</p>;

  const OfferCard = ({
    docId,
    start,
    end,
    date,
    seats,
    car,
    description,
  }: OfferCardProps) => (
    <div className="bg-white shadow-lg rounded-lg p-8 w-96 flex flex-col items-center mb-4">
      <h3 className="text-lg font-semibold mb-4">Начална точка: {start}</h3>
      <p>Крайна точка: {end}</p>
      <p>Дата: {date}</p>
      <p>Свободни места: {seats}</p>
      <Link
        href={{
          pathname: "/offer-details",
          query: {
            id: docId, // ID на обявата
            uid: user?.uid || "", // ID на потребителя
            start: encodeURIComponent(start),
            end: encodeURIComponent(end),
            date: encodeURIComponent(date),
            seats: encodeURIComponent(seats.toString()),
            car: encodeURIComponent(car || ""),
            description: encodeURIComponent(description || ""),
          },
        }}
        className="w-full bg-green-500 text-white font-bold py-3 mt-3 rounded-bl-xl rounded-tr-xl hover:bg-green-600 transition text-center"
      >
        Преглед
      </Link>
    </div>
  );

  return (
    <div className="flex flex-col bg-gray-100">
      <div className="flex flex-grow max-w-5xl mx-auto bg-white shadow-sm rounded-lg overflow-hidden">
        <aside className="w-1/3 bg-gray-50 border-r border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">Меню</h2>
          <ul className="space-y-4">
            <li>
              <button
                className={`w-full text-left py-3 px-4 rounded-lg ${
                  selectedTab === "profile"
                    ? "bg-green-100 text-green-700 font-semibold"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
                onClick={() => setSelectedTab("profile")}
              >
                Информация за профила
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left py-3 px-4 rounded-lg ${
                  selectedTab === "ads"
                    ? "bg-green-100 text-green-700 font-semibold"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
                onClick={() => setSelectedTab("ads")}
              >
                Моите обяви
              </button>
            </li>
          </ul>
        </aside>
        <main className="w-3/4 p-10">
          {selectedTab === "profile" && (
            <div className="bg-white shadow rounded-lg p-8">
              <div className="flex items-center space-x-6 mb-6">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Профилна снимка"
                    className="w-28 h-28 rounded-full border-4 border-green-500"
                  />
                ) : (
                  <div className="w-28 h-28 bg-gray-200 rounded-full text-gray-500 text-5xl flex items-center justify-center">
                    👤
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-semibold text-gray-800 mb-1">
                    {user.name}
                  </h1>
                  <RatingComponent rating={user.rating} votes={user.votes} />
                </div>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <strong>Потребителско име:</strong> {user.username}
                </li>
                <li>
                  <strong>Имейл:</strong> {user.email}
                </li>
                <li>
                  <strong>Дата на регистрация:</strong> {user.createdAt}
                </li>
              </ul>
              <button
                onClick={handleEdit}
                className="mt-6 bg-green-500 text-white font-bold py-2 px-6 rounded hover:bg-green-600"
              >
                Редактиране на профила
              </button>
            </div>
          )}
          {selectedTab === "ads" && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Моите обяви
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userAds.map((ad) => (
                  <OfferCard key={ad.docId} {...ad} />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
