"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDocs, query, collection, where } from "firebase/firestore";
import { db } from "../lib/firebase"; // Път до Firestore конфигурацията

const Login = ({ onSuccess }: { onSuccess: () => void }) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    if (!usernameOrEmail || !password) {
      setErrorMessage("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const isEmail = usernameOrEmail.includes("@");

      if (isEmail) {
        // Log in with email and password
        await signInWithEmailAndPassword(auth, usernameOrEmail, password);
      } else {
        // Log in with username
        const userQuery = query(
          collection(db, "users"),
          where("username", "==", usernameOrEmail)
        );
        const userDocs = await getDocs(userQuery);

        if (!userDocs.empty) {
          const userDoc = userDocs.docs[0];
          const userId = userDoc.id; // Get user ID from Firestore

          // Log in using email from Firestore
          await signInWithEmailAndPassword(
            auth,
            userDoc.data().email, // Get email from Firestore
            password
          );
        } else {
          setErrorMessage("User with this username not found.");
          setLoading(false);
          return;
        }
      }

      onSuccess(); // Redirect to home page after successful login
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === "auth/invalid-email") {
        setErrorMessage("Invalid email address.");
      } else if (error.code === "auth/wrong-password") {
        setErrorMessage("Wrong password.");
      } else if (error.code === "auth/user-not-found") {
        setErrorMessage("User not found.");
      } else {
        setErrorMessage(error.message || "Error during login.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
      <h1 className="text-center text-2xl font-bold mb-6">Log In</h1>
      <form onSubmit={handleLogin} className="flex flex-col space-y-4">
        <input
          type="text"
          placeholder="Email or Username"
          className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
        />
        <div className="relative">
          <input
            type="password"
            placeholder="Password"
            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span className="absolute right-4 top-3 text-gray-400 cursor-pointer">
            👁
          </span>
        </div>
        {errorMessage && (
          <div className="text-red-500 text-sm">{errorMessage}</div>
        )}
        <button
          type="submit"
          className={`w-full bg-green-500 text-white font-bold py-3 rounded-bl-xl rounded-tr-xl hover:bg-green-600 transition ${
            loading ? "bg-gray-400 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
    </div>
  );
};

export default Login;
