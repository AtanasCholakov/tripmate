"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { auth, db, storage } from "../lib/firebase"; // Използваме експортираните Firebase услуги
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface FormData {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterProps {
  onSuccess: () => void;
}

const Register = ({ onSuccess }: RegisterProps) => {
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
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

    const { name, username, email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Upload profile image to Firebase Storage
      let profileImageUrl = null;
      if (profileImage) {
        const storageRef = ref(storage, `profileImages/${user.uid}`);
        await uploadBytes(storageRef, profileImage);
        profileImageUrl = await getDownloadURL(storageRef);
      }

      // Update user profile in Firebase Auth
      await updateProfile(user, {
        displayName: username,
        photoURL: profileImageUrl,
      });

      // Save additional user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        username,
        email,
        profileImage: profileImageUrl,
        createdAt: serverTimestamp(),
      });

      setLoading(false);
      onSuccess(); // Redirect or notify successful registration
    } catch (error: any) {
      console.error("Error during registration:", error);
      setError(error.message || "Registration failed.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-3xl">
      <h1 className="text-center text-2xl font-bold mb-6">Create Profile</h1>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <form className="flex flex-col space-y-4 w-full" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={formData.name}
          placeholder="Name"
          onChange={handleInputChange}
          className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
        <input
          type="text"
          name="username"
          value={formData.username}
          placeholder="Username"
          onChange={handleInputChange}
          className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          placeholder="Email"
          onChange={handleInputChange}
          className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          placeholder="Password"
          onChange={handleInputChange}
          className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          placeholder="Confirm Password"
          onChange={handleInputChange}
          className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
        <input
          type="file"
          id="profileImage"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        <div className="flex flex-col items-center">
          <label
            htmlFor="profileImage"
            className="cursor-pointer bg-yellow-500 rounded-lg h-32 w-32 flex items-center justify-center text-white text-4xl"
          >
            {profileImage ? (
              <img
                src={URL.createObjectURL(profileImage)}
                alt="Profile"
                className="rounded-lg h-full w-full object-cover"
              />
            ) : (
              <span>+</span>
            )}
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white font-bold py-3 rounded-bl-xl rounded-tr-xl ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 transition"
          }`}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;
