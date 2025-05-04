"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  type Firestore,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { Star, Flag, Trash2, Menu } from "lucide-react";
import Link from "next/link";

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
  id: string;
  start: string;
  end: string;
  date: string;
  seats: number;
  car?: string;
  description?: string;
  onDelete?: (id: string) => void;
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
            className={`w-5 h-5 sm:w-6 sm:h-6 cursor-pointer transition-colors duration-200 ${
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
      <span className="text-gray-800 font-semibold text-sm sm:text-base">
        {rating.toFixed(1)}
      </span>
      <span className="text-gray-600 text-xs sm:text-sm">({votes} гласа)</span>
    </div>
  );
};

const ADMIN_EMAIL = "tripmate.contact@gmail.com";

const OfferCard = ({
  docId,
  id,
  start,
  end,
  date,
  seats,
  car,
  description,
  onDelete,
}: OfferCardProps) => {
  const [isDeleted, setIsDeleted] = useState(false);
  const user = auth.currentUser;

  const handleDeleteClick = async () => {
    if (onDelete) {
      await onDelete(docId);
      setIsDeleted(true);
    }
  };

  return (
    <div
      className={`bg-white shadow-lg rounded-lg p-4 sm:p-6 w-full flex flex-col justify-between mb-4 min-h-[300px] sm:min-h-[350px] ${
        isDeleted
          ? "opacity-0 scale-0 h-0 overflow-hidden"
          : "opacity-100 scale-100"
      } transition-all duration-500`}
    >
      <div className="flex flex-col flex-grow">
        <h3 className="text-lg font-semibold mb-2">Начална точка: {start}</h3>
        <p className="mb-1">Крайна точка: {end}</p>
        <p className="mb-1">Дата: {date}</p>
        <p className="mb-1">Свободни места: {seats}</p>
        {car && <p className="mb-1">Автомобил: {car}</p>}
      </div>
      <Link
        href={{
          pathname: "/offer-details",
          query: {
            id: docId,
            uid: id,
            start: encodeURIComponent(start),
            end: encodeURIComponent(end),
            date: encodeURIComponent(date),
            seats: encodeURIComponent(seats.toString()),
            car: encodeURIComponent(car || ""),
            description: encodeURIComponent(description || ""),
          },
        }}
        className="w-full bg-green-500 text-white font-bold py-3 mt-4 rounded-bl-xl rounded-tr-xl text-lg text-center relative overflow-hidden hover:bg-green-600 transition-all duration-300 transform hover:scale-105 group"
      >
        <span className="z-10 relative">Преглед</span>
        <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-30 transform scale-0 group-hover:scale-150 transition-all duration-500 ease-out"></span>
        <span className="absolute bottom-0 left-0 w-full h-1 bg-green-300 transform scale-x-0 group-hover:scale-x-100 transition-all duration-500 ease-in-out"></span>
        <span className="absolute top-0 left-0 w-full h-full bg-green-500 opacity-20 group-hover:opacity-0 transition-all duration-500 ease-in-out"></span>
      </Link>
      {user && user.email === ADMIN_EMAIL && (
        <button
          onClick={handleDeleteClick}
          className="w-full bg-red-500 text-white font-bold py-2 px-4 mt-2 rounded-md text-sm text-center relative overflow-hidden hover:bg-red-600 transition-all duration-300 transform hover:scale-105 group focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          <span className="z-10 relative">Изтриване</span>
          <span className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-600 opacity-30 transform scale-0 group-hover:scale-150 transition-all duration-500 ease-out"></span>
          <span className="absolute bottom-0 left-0 w-full h-1 bg-red-300 transform scale-x-0 group-hover:scale-x-100 transition-all duration-500 ease-in-out"></span>
          <span className="absolute top-0 left-0 w-full h-full bg-red-500 opacity-20 group-hover:opacity-0 transition-all duration-500 ease-in-out"></span>
        </button>
      )}
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
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [hasReported, setHasReported] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteVerification, setDeleteVerification] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "ads", id));
      setUserAds((prevAds) => prevAds.filter((ad) => ad.docId !== id));
    } catch (error) {
      console.error("Error deleting ad:", error);
    }
  };

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

  const handleDeleteUser = async () => {
    if (deleteVerification !== "DELETE") {
      alert("Моля, въведете 'DELETE' за да потвърдите изтриването на профила.");
      return;
    }

    try {
      // Delete user's ads
      const adsQuery = query(
        collection(db, "ads"),
        where("userId", "==", userId)
      );
      const adsSnapshot = await getDocs(adsQuery);
      const adDeletions = adsSnapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(adDeletions);

      // Delete user's ratings
      const ratingsQuery = query(
        collection(db, "ratings"),
        where("toUserId", "==", userId)
      );
      const ratingsSnapshot = await getDocs(ratingsQuery);
      const ratingDeletions = ratingsSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(ratingDeletions);

      // Delete user's reports
      const reportsQuery = query(
        collection(db, "reports"),
        where("reportedUserId", "==", userId)
      );
      const reportsSnapshot = await getDocs(reportsQuery);
      const reportDeletions = reportsSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(reportDeletions);

      // Delete user document
      await deleteDoc(doc(db, "users", userId));

      alert(
        "Потребителският профил и свързаните с него данни са изтрити успешно."
      );
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting user:", error);
      alert(
        "Възникна грешка при изтриването на потребителския профил. Моля, опитайте отново по-късно."
      );
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleTabChange = (tab: "profile" | "ads") => {
    setSelectedTab(tab);
    setIsMobileMenuOpen(false);
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
      {/* Mobile Menu Toggle */}
      <div className="md:hidden bg-white p-4 shadow-sm">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-full py-2 px-4 bg-green-500 text-white rounded-lg flex justify-between items-center"
        >
          <span>
            {selectedTab === "profile"
              ? "Информация за профила"
              : "Обяви на потребителя"}
          </span>
          <Menu
            className={`w-5 h-5 transition-transform ${
              isMobileMenuOpen ? "transform rotate-90" : ""
            }`}
          />
        </button>

        {isMobileMenuOpen && (
          <div className="mt-2 bg-white rounded-lg shadow-lg overflow-hidden">
            <button
              className={`w-full text-left py-3 px-4 ${
                selectedTab === "profile"
                  ? "bg-green-100 text-green-700 font-semibold"
                  : "text-gray-600"
              }`}
              onClick={() => handleTabChange("profile")}
            >
              Информация за профила
            </button>
            <button
              className={`w-full text-left py-3 px-4 ${
                selectedTab === "ads"
                  ? "bg-green-100 text-green-700 font-semibold"
                  : "text-gray-600"
              }`}
              onClick={() => handleTabChange("ads")}
            >
              Обяви н�� потребителя
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row flex-grow max-w-7xl mx-auto w-full px-4 py-4 md:py-8">
        {/* Sidebar for desktop */}
        <aside className="hidden md:block w-full md:w-1/4 bg-gray-50 border-r border-gray-200 p-4 md:p-6 rounded-lg md:rounded-none md:rounded-l-lg">
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

        <main className="w-full md:w-3/4 p-4 md:p-6 lg:p-10 bg-white rounded-lg md:rounded-none md:rounded-r-lg shadow-sm">
          {selectedTab === "profile" && (
            <div className="bg-white shadow rounded-lg p-4 sm:p-6 md:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:space-x-6 mb-6">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture || "/placeholder.svg"}
                    alt="Профилна снимка"
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-green-500 mb-4 sm:mb-0"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-full text-gray-500 text-5xl sm:text-6xl flex items-center justify-center mb-4 sm:mb-0">
                    👤
                  </div>
                )}
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                    {user.name}
                  </h1>
                  <p className="text-lg sm:text-xl text-gray-600 mb-1">
                    @{user.username}
                  </p>
                  <p className="text-gray-500 text-sm sm:text-base">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="mb-6 flex justify-center sm:justify-start">
                <RatingComponent
                  rating={user.rating}
                  votes={user.votes}
                  onRate={handleRating}
                />
                {hasRated && (
                  <p className="text-sm text-gray-500 mt-2 ml-2">
                    Вие вече сте гласували за този потребител.
                  </p>
                )}
              </div>

              <div className="bg-gray-100 rounded-lg p-4 mb-6">
                <p className="text-gray-600 text-sm sm:text-base">
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
                  <span className="text-sm sm:text-base">
                    {hasReported
                      ? "Вече сте докладвали този потребител"
                      : "Докладвай потребител"}
                  </span>
                </button>
              </div>

              {auth.currentUser && auth.currentUser.email === ADMIN_EMAIL && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
                  >
                    <Trash2 className="mr-2" size={16} />
                    <span className="text-sm sm:text-base">
                      Изтрий потребителя
                    </span>
                  </button>
                </div>
              )}

              {showReportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
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
                    <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                      <button
                        onClick={() => setShowReportModal(false)}
                        className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-400 transition-colors duration-300"
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

              {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                    <h3 className="text-xl font-bold mb-4">
                      Изтриване на потребител
                    </h3>
                    <p className="mb-4 text-sm sm:text-base">
                      Това действие ще изтрие потребителския профил и всички
                      свързани с него данни. Въведете &quot;DELETE&quot; за да
                      потвърдите.
                    </p>
                    <input
                      type="text"
                      value={deleteVerification}
                      onChange={(e) => setDeleteVerification(e.target.value)}
                      className="w-full p-2 border rounded mb-4"
                      placeholder="Въведете DELETE"
                    />
                    <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                      <button
                        onClick={() => setShowDeleteModal(false)}
                        className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-400 transition-colors duration-300"
                      >
                        Отказ
                      </button>
                      <button
                        onClick={handleDeleteUser}
                        disabled={deleteVerification !== "DELETE"}
                        className={`${
                          deleteVerification === "DELETE"
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-gray-300 cursor-not-allowed"
                        } text-white font-bold py-2 px-4 rounded transition-colors duration-300`}
                      >
                        Изтрий
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedTab === "ads" && (
            <div className="bg-white shadow rounded-lg p-4 sm:p-6 md:p-8 min-h-[300px] sm:min-h-[500px]">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Обяви на потребителя
              </h2>
              {userAds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {userAds.map((ad) => (
                    <OfferCard
                      key={ad.docId}
                      docId={ad.docId}
                      id={ad.userId}
                      start={ad.start}
                      end={ad.end}
                      date={ad.date}
                      seats={ad.seats}
                      car={ad.car}
                      description={ad.description}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-10">
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
