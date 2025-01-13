import { useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import {
  onAuthStateChanged,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserProfile {
  uid: string;
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
  onDelete: (docId: string) => void;
  onEdit: (docId: string) => void;
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
  const [password, setPassword] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
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
            uid: uid,
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

  const handleEdit = (docId: string) => router.push(`/ad-edit?id=${docId}`);

  const handleDelete = async (docId: string) => {
    try {
      setUserAds((prevAds) => prevAds.filter((ad) => ad.docId !== docId));
      await deleteDoc(doc(db, "ads", docId));
      alert("Обявата беше изтрита успешно!");
    } catch (err) {
      console.error(err);
      alert("Възникна грешка при изтриването на обявата.");
    }
  };

  const handleDeleteProfile = async () => {
    if (!password) {
      alert("Моля въведете паролата си.");
      return;
    }
    try {
      const userCredential = EmailAuthProvider.credential(
        user?.email!,
        password
      );
      await reauthenticateWithCredential(auth.currentUser!, userCredential);
      // Proceed with profile deletion after successful reauthentication
      await deleteDoc(doc(db, "users", user?.uid!));
      alert("Профилът е изтрит успешно!");
      router.push("/");
    } catch (err) {
      console.error(err);
      alert("Грешка при изтриването на профила. Проверете паролата си.");
    }
  };

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
    onDelete,
    onEdit,
  }: OfferCardProps) => {
    const [isDeleted, setIsDeleted] = useState(false);

    const handleDeleteClick = () => {
      setIsDeleted(true);
      setTimeout(() => {
        onDelete(docId);
      }, 500);
    };

    return (
      <div
        className={`bg-white shadow-lg rounded-lg p-8 w-full min-h-[350px] flex flex-col items-center mb-4 ${
          isDeleted
            ? "opacity-0 scale-0 h-0 overflow-hidden"
            : "opacity-100 scale-100 h-auto"
        } transition-all duration-500`}
      >
        <h3 className="text-lg font-semibold mb-4">Начална точка: {start}</h3>
        <p>Крайна точка: {end}</p>
        <p>Дата: {date}</p>
        <p>Свободни места: {seats}</p>
        <Link
          href={{
            pathname: "/offer-details",
            query: {
              id: docId,
              uid: user?.uid || "",
              start: encodeURIComponent(start),
              end: encodeURIComponent(end),
              date: encodeURIComponent(date),
              seats: encodeURIComponent(seats.toString()),
              car: encodeURIComponent(car || ""),
              description: encodeURIComponent(description || ""),
            },
          }}
          className="w-full bg-green-500 text-white font-bold py-3 mt-3 mx-auto rounded-bl-xl rounded-tr-xl text-lg text-center relative overflow-hidden hover:bg-green-600 transition-all duration-300 transform hover:scale-105 group"
        >
          <span className="z-10 relative">Преглед</span>
          <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-30 transform scale-0 group-hover:scale-150 transition-all duration-500 ease-out"></span>
          <span className="absolute bottom-0 left-0 w-full h-1 bg-green-300 transform scale-x-0 group-hover:scale-x-100 transition-all duration-500 ease-in-out"></span>
          <span className="absolute top-0 left-0 w-full h-full bg-green-500 opacity-20 group-hover:opacity-0 transition-all duration-500 ease-in-out"></span>
        </Link>

        <div className="flex justify-between mt-4 w-full space-x-4">
          <button
            onClick={() => onEdit(docId)}
            className="w-1/2 bg-yellow-500 text-white font-bold py-2 px-4 rounded-md text-sm text-center relative overflow-hidden hover:bg-yellow-600 transition-all duration-300 transform hover:scale-105 group focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <span className="z-10 relative">Редактиране</span>
            <span className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 opacity-30 transform scale-0 group-hover:scale-150 transition-all duration-500 ease-out"></span>
            <span className="absolute bottom-0 left-0 w-full h-1 bg-yellow-300 transform scale-x-0 group-hover:scale-x-100 transition-all duration-500 ease-in-out"></span>
            <span className="absolute top-0 left-0 w-full h-full bg-yellow-500 opacity-20 group-hover:opacity-0 transition-all duration-500 ease-in-out"></span>
          </button>

          <button
            onClick={handleDeleteClick}
            className="w-1/2 bg-red-500 text-white font-bold py-2 px-4 rounded-md text-sm text-center relative overflow-hidden hover:bg-red-600 transition-all duration-300 transform hover:scale-105 group focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <span className="z-10 relative">Изтриване</span>
            <span className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-600 opacity-30 transform scale-0 group-hover:scale-150 transition-all duration-500 ease-out"></span>
            <span className="absolute bottom-0 left-0 w-full h-1 bg-red-300 transform scale-x-0 group-hover:scale-x-100 transition-all duration-500 ease-in-out"></span>
            <span className="absolute top-0 left-0 w-full h-full bg-red-500 opacity-20 group-hover:opacity-0 transition-all duration-500 ease-in-out"></span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col bg-gray-100">
      <div className="flex flex-grow max-w-7xl mx-auto bg-white shadow-sm rounded-lg overflow-hidden">
        <aside className="w-1/4 bg-gray-50 border-r border-gray-200 p-6">
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
                  <p className="text-gray-600">{user.username}</p>
                  <p className="text-gray-500">{user.email}</p>
                </div>
              </div>

              <RatingComponent rating={user.rating} votes={user.votes} />

              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">
                  Опции
                </h3>
                <div className="space-y-4">
                  <button
                    onClick={() => router.push("/profile/edit")}
                    className="w-full bg-yellow-500 text-white font-bold py-2 px-4 rounded-md text-sm text-center"
                  >
                    Редактиране на профила
                  </button>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded-md text-sm text-center"
                  >
                    Изтриване на профил
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedTab === "ads" && (
            <div className="bg-white shadow rounded-lg p-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Моите обяви
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
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                  />
                ))
              ) : (
                <p className="text-gray-500">Нямате обяви.</p>
              )}
            </div>
          )}
        </main>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-bold mb-4">Потвърдете паролата си</h2>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
              placeholder="Вашата парола"
            />
            <div className="flex justify-between">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="w-1/2 bg-gray-300 py-2 rounded-md text-center text-gray-700"
              >
                Отказ
              </button>
              <button
                onClick={handleDeleteProfile}
                className="w-1/2 bg-red-500 py-2 rounded-md text-center text-white"
              >
                Изтриване на профил
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
