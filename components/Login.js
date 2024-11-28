"use client";

import { useState } from "react";
import { useRouter } from "next/router"; // За навигация след успешен логин

const Login = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Проверка дали полетата не са празни
    if (!usernameOrEmail || !password) {
      setErrorMessage("Моля, попълнете всички полета.");
      return;
    }

    try {
      // Изпращаме POST заявка към API-то
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Съхраняване на токен в localStorage или cookies
        localStorage.setItem("token", data.token);

        // Пренасочваме към друга страница след успешен логин
        router.push("/dashboard"); // Например, страницата за профила
      } else {
        setErrorMessage(data.message || "Грешка при влизане.");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Възникна грешка при връзката със сървъра.");
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
      <h1 className="text-center text-2xl font-bold mb-6">Влизане в профил</h1>
      <form onSubmit={handleLogin} className="flex flex-col space-y-4">
        <input
          type="text"
          placeholder="Имейл или потребителско име"
          className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
        />
        <div className="relative">
          <input
            type="password"
            placeholder="Парола"
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
          className="w-full bg-green-500 text-white font-bold py-3 rounded-bl-xl rounded-tr-xl hover:bg-green-600 transition"
        >
          Вход
        </button>
      </form>
    </div>
  );
};

export default Login;
