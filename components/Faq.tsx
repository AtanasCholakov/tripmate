"use client";

import Link from "next/link";

const Faq = () => {
  const faqs = [
    {
      question: "Как мога да се регистрирам?",
      answer: (
        <>
          За да се регистрирате, кликнете върху{" "}
          <Link
            href="/register"
            className="text-yellow-500 font-bold hover:underline"
          >
            Регистрация
          </Link>{" "}
          в горния десен ъгъл и следвайте инструкциите.
        </>
      ),
    },
    {
      question: "Как да публикувам обява?",
      answer: (
        <>
          След като сте влезли в профила си, кликнете върху{" "}
          <Link
            href="/create-ad"
            className="text-yellow-500 font-bold hover:underline"
          >
            Създай обява
          </Link>{" "}
          и попълнете необходимата информация.
        </>
      ),
    },
    {
      question: "Какво да правя, ако забравя паролата си?",
      answer: (
        <>
          На страницата за вход кликнете върху{" "}
          <Link
            href="/forgot-password"
            className="text-yellow-500 font-bold hover:underline"
          >
            Забравена парола
          </Link>{" "}
          и следвайте стъпките за възстановяване.
        </>
      ),
    },
  ];

  return (
    <section className="py-16 bg-white">
      <h2 className="text-center text-4xl font-bold text-gray-800 mb-12">
        Често задавани <span className="text-yellow-500">въпроси</span>
      </h2>
      <div className="max-w-4xl mx-auto space-y-12">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="relative bg-white border border-gray-200 rounded-3xl shadow-lg p-8 transition-transform duration-500 hover:shadow-2xl hover:scale-105 group overflow-hidden"
          >
            <div className="relative z-10">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                {faq.question}
              </h3>
              <p className="text-lg text-gray-700">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Faq;
