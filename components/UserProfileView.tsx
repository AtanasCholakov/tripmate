"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  Firestore,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { Star, Calendar, MapPin, Users, Flag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  username: string;
  profilePicture?: string;
  rating: number;
  votes: number;
  createdAt: string;
}

interface UserProfileViewProps {
  userId: string;
}

interface OfferCardProps {
  docId: string;
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
  onRate,
}: {
  rating: number;
  votes: number;
  onRate: (rating: number) => void;
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  return (
    <div className="flex items-center space-x-2">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 cursor-pointer transition-colors duration-200 ${
              star <= (hoveredRating || rating)
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => onRate(star)}
          />
        ))}
      </div>
      <span className="text-gray-800 font-semibold">{rating.toFixed(1)}</span>
      <span className="text-gray-600 text-sm">({votes} гласа)</span>
    </div>
  );
};

const OfferCard = ({
  docId,
  start,
  end,
  date,
  seats,
  car,
  description,
}: OfferCardProps) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-4 transition-all duration-300 hover:shadow-xl">
      <h3 className="text-lg font-semibold mb-2">
        От {start} до {end}
      </h3>
      <p className="text-gray-600 mb-2">
        <Calendar className="inline-block mr-2" size={16} />
        {date}
      </p>
      <p className="text-gray-600 mb-2">
        <Users className="inline-block mr-2" size={16} />
        {seats} свободни места
      </p>
      {car && (
        <p className="text-gray-600 mb-2">
          <span className="font-semibold">Автомобил:</span> {car}
        </p>
      )}
      {description && (
        <p className="text-gray-600 mb-4">
          <span className="font-semibold">Описание:</span> {description}
        </p>
      )}
      <Link
        href={{
          pathname: "/offer-details",
          query: { id: docId },
        }}
        className="bg-green-500 text-white font-bold py-2 px-4 rounded-full hover:bg-green-600 transition-colors duration-300"
      >
        Преглед
      </Link>
    </div>
  );
};

export default function UserProfileView({ userId }: UserProfileViewProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAds, setUserAds] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<"profile" | "ads">("profile");
  const [hasRated, setHasRated] = useState(false);
  const router = useRouter();
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [hasReported, setHasReported] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db as Firestore, "users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const ratingsQuery = query(
            collection(db, "ratings"),
            where("toUserId", "==", userId)
          );
          const ratingsSnapshot = await getDocs(ratingsQuery);
          const totalVotes = ratingsSnapshot.size;
          const totalRating = ratingsSnapshot.docs.reduce(
            (sum, doc) => sum + doc.data().rating,
            0
          );
          const averageRating = totalVotes > 0 ? totalRating / totalVotes : 0;

          setUser({
            uid: userId,
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

          // Check if the current user has already rated
          const currentUser = auth.currentUser;
          if (currentUser) {
            const userRatingQuery = query(
              collection(db, "ratings"),
              where("fromUserId", "==", currentUser.uid),
              where("toUserId", "==", userId)
            );
            const userRatingSnapshot = await getDocs(userRatingQuery);
            setHasRated(!userRatingSnapshot.empty);
          }
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

    const fetchUserAds = async () => {
      try {
        const adsQuery = query(
          collection(db, "ads"),
          where("userId", "==", userId)
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

    fetchUserData();
    fetchUserAds();
  }, [userId]);

  useEffect(() => {
    const checkIfReported = async () => {
      if (!auth.currentUser) return;

      const reportRef = collection(db, "reports");
      const q = query(
        reportRef,
        where("reporterId", "==", auth.currentUser.uid),
        where("reportedUserId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      setHasReported(!querySnapshot.empty);
    };

    checkIfReported();
  }, [userId]);

  const handleRating = async (newRating: number) => {
    if (hasRated || !auth.currentUser) return;

    try {
      await addDoc(collection(db, "ratings"), {
        fromUserId: auth.currentUser.uid,
        toUserId: userId,
        rating: newRating,
      });

      // Update user's average rating
      const ratingsQuery = query(
        collection(db, "ratings"),
        where("toUserId", "==", userId)
      );
      const ratingsSnapshot = await getDocs(ratingsQuery);
      const totalVotes = ratingsSnapshot.size;
      const totalRating = ratingsSnapshot.docs.reduce(
        (sum, doc) => sum + doc.data().rating,
        0
      );
      const newAverageRating = totalRating / totalVotes;

      await updateDoc(doc(db as Firestore, "users", userId), {
        rating: newAverageRating,
        votes: totalVotes,
      });

      setUser((prevUser) =>
        prevUser
          ? {
              ...prevUser,
              rating: newAverageRating,
              votes: totalVotes,
            }
          : null
      );

      setHasRated(true);
    } catch (error) {
      console.error("Error adding rating:", error);
    }
  };

  const handleReport = async () => {
    if (!auth.currentUser || !reportReason) return;

    try {
      const reportRef = collection(db, "reports");
      await addDoc(reportRef, {
        reporterId: auth.currentUser.uid,
        reportedUserId: userId,
        reason: reportReason,
        timestamp: new Date(),
      });

      setHasReported(true);
      setShowReportModal(false);
      alert("Благодарим за вашия сигнал. Ще го разгледаме възможно най-скоро.");
    } catch (error) {
      console.error("Error submitting report:", error);
      alert(
        "Възникна грешка при подаването на сигнала. Моля, опитайте отново по-късно."
      );
    }
  };

  if (loading) {
    return <div className="text-center py-10">Зареждане на профила...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!user) {
    return <div className="text-center py-10">Потребителят не е намерен.</div>;
  }

  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
      <div className="flex flex-grow max-w-7xl mx-auto bg-white shadow-sm rounded-lg overflow-hidden my-8">
        <aside className="w-1/4 bg-gray-50 border-r border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">Меню</h2>
          <ul className="space-y-4">
            <li>
              <button
                className={`w-full text-left py-3 px-4 rounded-lg transition-colors duration-200 ${
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
                className={`w-full text-left py-3 px-4 rounded-lg transition-colors duration-200 ${
                  selectedTab === "ads"
                    ? "bg-green-100 text-green-700 font-semibold"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
                onClick={() => setSelectedTab("ads")}
              >
                Обяви на потребителя
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
                    src={user.profilePicture || "/placeholder.svg"}
                    alt="Профилна снимка"
                    className="w-32 h-32 rounded-full object-cover border-4 border-green-500"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 rounded-full text-gray-500 text-6xl flex items-center justify-center">
                    👤
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {user.name}
                  </h1>
                  <p className="text-xl text-gray-600 mb-1">@{user.username}</p>
                  <p className="text-gray-500">{user.email}</p>
                </div>
              </div>

              <div className="mb-6">
                <RatingComponent
                  rating={user.rating}
                  votes={user.votes}
                  onRate={handleRating}
                />
                {hasRated && (
                  <p className="text-sm text-gray-500 mt-2">
                    Вие вече сте гласували за този потребител.
                  </p>
                )}
              </div>

              <div className="bg-gray-100 rounded-lg p-4 mb-6">
                <p className="text-gray-600">
                  <span className="font-semibold">Регистриран на:</span>{" "}
                  {user.createdAt}
                </p>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowReportModal(true)}
                  disabled={hasReported}
                  className={`flex items-center ${
                    hasReported
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600"
                  } text-white font-bold py-2 px-4 rounded transition-colors duration-300`}
                >
                  <Flag className="mr-2" size={16} />
                  {hasReported
                    ? "Вече сте докладвали този потребител"
                    : "Докладвай потребител"}
                </button>
              </div>

              {showReportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg shadow-xl">
                    <h3 className="text-xl font-bold mb-4">
                      Докладвай потребител
                    </h3>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full p-2 border rounded mb-4"
                    >
                      <option value="">Изберете причина</option>
                      <option value="spam">Спам</option>
                      <option value="inappropriate">
                        Неподходящо съдържание
                      </option>
                      <option value="fake">Фалшив профил</option>
                      <option value="other">Друго</option>
                    </select>
                    <div className="flex justify-end">
                      <button
                        onClick={() => setShowReportModal(false)}
                        className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded mr-2 hover:bg-gray-400 transition-colors duration-300"
                      >
                        Отказ
                      </button>
                      <button
                        onClick={handleReport}
                        disabled={!reportReason}
                        className={`${
                          reportReason
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-gray-300 cursor-not-allowed"
                        } text-white font-bold py-2 px-4 rounded transition-colors duration-300`}
                      >
                        Изпрати
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedTab === "ads" && (
            <div className="bg-white shadow rounded-lg p-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Обяви на потребителя
              </h2>
              {userAds.length > 0 ? (
                userAds.map((ad) => (
                  <OfferCard
                    key={ad.docId}
                    docId={ad.docId}
                    start={ad.start}
                    end={ad.end}
                    date={ad.date}
                    seats={ad.seats}
                    car={ad.car}
                    description={ad.description}
                  />
                ))
              ) : (
                <p className="text-gray-500">
                  Този потребител няма активни обяви.
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
