"use client";

import { useState } from "react";
import Link from "next/link";
import { auth, db } from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  getDocs,
  query,
  collection,
  where,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import type React from "react"; // Added import for React

const Login = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    if (!usernameOrEmail || !password) {
      setErrorMessage("Моля попълнете всички полета!");
      setLoading(false);
      return;
    }

    try {
      const isEmail = usernameOrEmail.includes("@");
      let email = usernameOrEmail;

      if (!isEmail) {
        // Log in with username
        const userQuery = query(
          collection(db, "users"),
          where("username", "==", usernameOrEmail)
        );
        const userDocs = await getDocs(userQuery);

        if (!userDocs.empty) {
          const userDoc = userDocs.docs[0];
          email = userDoc.data().email;
        } else {
          setErrorMessage("Потребителят не е намерен!");
          setLoading(false);
          return;
        }
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (!user.emailVerified) {
        await auth.signOut();
        setErrorMessage("Моля потвърдете имейл адреса си!");
        setLoading(false);
        return;
      }

      window.location.href = "/";
    } catch (error: any) {
      console.error("Login error:", error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if the user already exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        // Save user data to Firestore only if it doesn't exist
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName,
          username: user.email?.split("@")[0], // Use email as username
          email: user.email,
          rating: 0,
          createdAt: new Date(),
          emailVerified: true, // Google accounts are automatically verified
        });
      }

      window.location.href = "/";
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (error: any): string => {
    switch (error.code) {
      case "auth/invalid-email":
        return "Невалиден имейл адрес!";
      case "auth/wrong-password":
        return "Грешна парола!";
      case "auth/invalid-credential":
        return "Входните данни са невалидни!";
      case "auth/user-not-found":
        return "Потребителят не е намерен!";
      case "auth/popup-closed-by-user":
        return "Прозорецът за вход беше затворен. Моля, опитайте отново.";
      case "auth/operation-not-allowed":
        return "Този метод за вход не е разрешен. Моля, свържете се с поддръжката.";
      default:
        return error.message || "Грешка при влизане.";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg"
    >
      <h1 className="text-center text-2xl font-bold mb-6">Влизане в профил</h1>
      <form onSubmit={handleLogin} className="flex flex-col space-y-4">
        <input
          type="text"
          placeholder="Потребителско име или имейл"
          className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
        />
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Парола"
            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        <Link
          href="/forgot-password"
          className="text-sm text-green-500 hover:underline self-end"
        >
          Забравена парола?
        </Link>
        {errorMessage && (
          <div className="text-red-500 text-sm">{errorMessage}</div>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className={`relative w-full bg-green-500 text-white font-bold py-3 rounded-bl-xl rounded-tr-xl overflow-hidden group ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "hover:bg-green-600 transition"
          }`}
          disabled={loading}
        >
          <span className="relative z-10">
            {loading ? "Влизане..." : "Вход"}
          </span>
          {!loading && (
            <>
              <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-30 transform scale-0 group-hover:scale-150 transition-all duration-500 ease-out"></span>
              <span className="absolute bottom-0 left-0 w-full h-1 bg-green-300 transform scale-x-0 group-hover:scale-x-100 transition-all duration-500 ease-in-out"></span>
              <span className="absolute top-0 left-0 w-full h-full bg-green-500 opacity-20 group-hover:opacity-0 transition-all duration-500 ease-in-out"></span>
            </>
          )}
        </motion.button>
      </form>
      <div className="mt-4">
        <p className="text-center">или</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-lg mt-2 hover:bg-gray-100 transition"
        >
          Вход с Google
        </motion.button>
      </div>
      <p className="text-center mt-4">
        Нямаш акаунт?{" "}
        <Link href="/register" className="text-green-500 hover:underline">
          Регистрирай се тук
        </Link>
      </p>
    </motion.div>
  );
};

export default Login;
