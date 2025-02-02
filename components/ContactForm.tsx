"use client";

import { useState } from "react";
import emailjs from "@emailjs/browser";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
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
      await emailjs.send(
        "service_g63we7y",
        "template_vcxrdrr",
        {
          from_name: formData.name,
          message: formData.message,
        },
        "g5QXpArASbTPTDIyj"
      );

      setStatus("success");
      setFormData({ name: "", message: "" });
    } catch (error) {
      console.error("Error sending email:", error);
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
              className="relative bg-yellow-500 text-white px-6 py-2 rounded-bl-xl rounded-tr-xl text-lg font-bold overflow-hidden group transition-all duration-300 hover:scale-105 hover:bg-yellow-600"
            >
              <span className="relative z-10">
                {status === "sending" ? "Изпращане..." : "Изпрати съобщението"}
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 opacity-30 transform scale-0 group-hover:scale-150 transition-all duration-500 ease-out"></span>
              <span className="absolute bottom-0 left-1/2 w-0 h-1 bg-yellow-300 transform group-hover:w-full group-hover:left-0 transition-all duration-500 ease-in-out"></span>
              <span className="absolute top-0 left-0 w-full h-full bg-yellow-500 opacity-20 group-hover:opacity-0 transition-all duration-500 ease-in-out"></span>
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
