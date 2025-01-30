"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDocs, query, collection, where } from "firebase/firestore";
import { motion } from "framer-motion";

const Login = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

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
          setErrorMessage("User with this username not found.");
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
        setErrorMessage("Please verify your email before logging in.");
        setLoading(false);
        return;
      }

      router.push("/"); // Redirect to home page after successful login
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg"
    >
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
            {loading ? "Logging in..." : "Log In"}
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
    </motion.div>
  );
};

export default Login;
