"use client";

import { useState } from "react";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        throw new Error("Failed to send message.");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <section className="py-16 bg-white">
      <h2 className="text-center text-4xl font-bold text-gray-800 mb-12">
        Свържете се с <span className="text-yellow-500">нас</span>
      </h2>
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-3xl shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-lg font-medium text-gray-700"
            >
              Име
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-yellow-500 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-lg font-medium text-gray-700"
            >
              Имейл
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-yellow-500 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="message"
              className="block text-lg font-medium text-gray-700"
            >
              Съобщение
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-yellow-500 focus:outline-none"
            />
          </div>
          <div className="text-center">
            <button
              type="submit"
              disabled={status === "sending"}
              className="relative bg-yellow-500 text-white px-6 py-2 rounded-bl-xl rounded-tr-xl text-lg font-bold overflow-hidden group hover:bg-yellow-600 transition duration-300"
            >
              {status === "sending" ? "Изпращане..." : "Изпрати съобщението"}
            </button>
          </div>
        </form>
        {status === "success" && (
          <p className="text-green-600 text-center mt-4">
            Съобщението е изпратено успешно!
          </p>
        )}
        {status === "error" && (
          <p className="text-red-600 text-center mt-4">
            Възникна грешка при изпращането. Опитайте отново.
          </p>
        )}
      </div>
    </section>
  );
};

export default ContactForm;
