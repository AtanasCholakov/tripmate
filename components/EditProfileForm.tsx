"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../lib/firebase";
import {
  updateProfile,
  updateEmail,
  updatePassword,
  User,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

interface FormData {
  name: string;
  username: string;
  email: string;
  newPassword: string;
  confirmNewPassword: string;
}

const EditProfileForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    username: "",
    email: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserData(currentUser);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchUserData = async (currentUser: User) => {
    try {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setFormData({
          name: userData.name || "",
          username: userData.username || "",
          email: currentUser.email || "",
          newPassword: "",
          confirmNewPassword: "",
        });
      }
    } catch (error) {
      console.error("Грешка при зареждане на потребителските данни:", error);
      setError("Неуспешно зареждане на данните. Моля, опитайте отново.");
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { name, username, email, newPassword, confirmNewPassword } = formData;

    if (newPassword !== confirmNewPassword) {
      setError("Новите пароли не съвпадат.");
      setLoading(false);
      return;
    }

    try {
      if (!user) throw new Error("Няма удостоверен потребител");

      // Обновяване на профила в Firebase Auth
      await updateProfile(user, {
        displayName: username,
      });

      // Обновяване на имейла, ако е променен
      if (email !== user.email) {
        await updateEmail(user, email);
      }

      // Обновяване на паролата, ако е предоставена
      if (newPassword) {
        await updatePassword(user, newPassword);
      }

      // Обновяване на документа в Firestore
      await updateDoc(doc(db, "users", user.uid), {
        name,
        username,
        email,
      });

      // Пренасочване към страницата на профила или началната страница
      router.push("/profile");
    } catch (error: any) {
      console.error("Грешка при обновяване на профила:", error);
      setError("Неуспешно обновяване на профила. Моля, опитайте отново.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-3xl">
      <h1 className="text-center text-2xl font-bold mb-6">
        Редактиране на профила
      </h1>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <form className="flex flex-col space-y-4 w-full" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={formData.name}
          placeholder="Име"
          onChange={handleInputChange}
          className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
        <input
          type="text"
          name="username"
          value={formData.username}
          placeholder="Потребителско име"
          onChange={handleInputChange}
          className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          placeholder="Имейл"
          onChange={handleInputChange}
          className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
        <input
          type="password"
          name="newPassword"
          value={formData.newPassword}
          placeholder="Нова парола (оставете празно, за да запазите текущата)"
          onChange={handleInputChange}
          className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          type="password"
          name="confirmNewPassword"
          value={formData.confirmNewPassword}
          placeholder="Потвърдете новата парола"
          onChange={handleInputChange}
          className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-green-500 text-white font-bold py-2 px-4 rounded-md text-sm text-center relative overflow-hidden hover:bg-green-600 transition-all duration-300 transform hover:scale-105 group focus:outline-none focus:ring-2 focus:ring-green-400 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <span className="z-10 text-lg relative">
            {loading ? "Обновяване..." : "Обнови профила"}
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-30 transform scale-0 group-hover:scale-150 transition-all duration-500 ease-out"></span>
          <span className="absolute bottom-0 left-0 w-full h-1 bg-green-300 transform scale-x-0 group-hover:scale-x-100 transition-all duration-500 ease-in-out"></span>
          <span className="absolute top-0 left-0 w-full h-full bg-green-500 opacity-20 group-hover:opacity-0 transition-all duration-500 ease-in-out"></span>
        </button>
      </form>
    </div>
  );
};

export default EditProfileForm;
