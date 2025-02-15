"use client";

import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "../lib/firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

interface FirebaseAuthError extends Error {
  code?: string;
}

interface FormData {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        window.location.href = "/";
      }
    });

    return () => unsubscribe();
  }, []);

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

    const { name, username, email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      setError("Паролите не съвпадат.");
      setLoading(false);
      return;
    }

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update Firebase Auth profile with username
      await updateProfile(user, {
        displayName: username,
      });

      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        username,
        email,
        rating: 0,
        createdAt: new Date(),
        emailVerified: false,
      });

      // Send verification email
      const actionCodeSettings = {
        url: `${window.location.origin}/auth-action?mode=verifyEmail`,
        handleCodeInApp: true,
      };
      await sendEmailVerification(user, actionCodeSettings);

      // Redirect to a confirmation page
      router.push("/register-confirmation");
    } catch (error: unknown) {
      console.error("Error during registration:", error);
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
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
    } catch (error: unknown) {
      console.error("Error during Google sign-in:", error);
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      const firebaseError = error as FirebaseAuthError;
      switch (firebaseError.code) {
        case "auth/email-already-in-use":
          return "This email is already registered. Please try logging in.";
        case "auth/invalid-email":
          return "Invalid email address. Please check and try again.";
        case "auth/weak-password":
          return "Password is too weak. Please use a stronger password.";
        case "auth/operation-not-allowed":
          return "This sign-in method is not allowed. Please contact support.";
        case "auth/popup-closed-by-user":
          return "Sign-in popup was closed. Please try again.";
        default:
          return (
            firebaseError.message ||
            "An error occurred during registration. Please try again."
          );
      }
    }
    return "An unexpected error occurred during registration.";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-lg rounded-lg p-8 w-full max-w-3xl"
    >
      <h1 className="text-center text-2xl font-bold mb-6">
        Създаване на профил
      </h1>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <form className="flex flex-col space-y-4 w-full" onSubmit={handleSubmit}>
        <motion.input
          whileFocus={{ scale: 1.05 }}
          type="text"
          name="name"
          value={formData.name}
          placeholder="Име"
          onChange={handleInputChange}
          className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
        <motion.input
          whileFocus={{ scale: 1.05 }}
          type="text"
          name="username"
          value={formData.username}
          placeholder="Потребителско име"
          onChange={handleInputChange}
          className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
        <motion.input
          whileFocus={{ scale: 1.05 }}
          type="email"
          name="email"
          value={formData.email}
          placeholder="Имейл"
          onChange={handleInputChange}
          className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
        <div className="relative">
          <motion.input
            whileFocus={{ scale: 1.05 }}
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            placeholder="Парола"
            onChange={handleInputChange}
            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
            required
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
        <div className="relative">
          <motion.input
            whileFocus={{ scale: 1.05 }}
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            placeholder="Потвърди паролата"
            onChange={handleInputChange}
            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={loading}
          className={`relative w-full text-white font-bold py-3 rounded-bl-xl rounded-tr-xl overflow-hidden group ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 transition"
          }`}
        >
          <span className="relative z-10">
            {loading ? "Регистриране..." : "Регистрация"}
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
          Регистрация с Google
        </motion.button>
      </div>
      <p className="text-center mt-4">
        Вече имаш акаунт?{" "}
        <Link href="/login" className="text-green-500 hover:underline">
          Влез тук
        </Link>
      </p>
    </motion.div>
  );
};

export default Register;
