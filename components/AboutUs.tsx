"use client";

const AboutUs = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 py-16">
      {/* Декоративни елементи */}
      <div className="absolute -top-10 left-0 w-40 h-40 bg-yellow-300 opacity-50 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-20 right-10 w-48 h-48 bg-yellow-500 opacity-30 rounded-full blur-2xl animate-pulse-slow"></div>
      <div className="absolute bottom-0 left-10 w-32 h-32 bg-yellow-200 opacity-40 rounded-full blur-2xl"></div>

      {/* Заглавие */}
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <h1 className="text-5xl font-extrabold text-gray-800 text-center mb-8">
          За нас
        </h1>
        <p className="text-lg text-gray-600 text-center leading-relaxed max-w-3xl mx-auto">
          Ние от <span className="text-yellow-500 font-bold">TripMate</span>{" "}
          вярваме, че пътуването може да бъде не само удобно, но и по-екологично
          и достъпно. Нашата мисия е да свързваме хората, да намаляваме
          разходите за транспорт и да допринасяме за по-зелено бъдеще.
        </p>
      </div>

      {/* Основно съдържание */}
      <div className="relative z-10 mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto px-6">
        {/* Карта 1 */}
        <div className="group bg-white shadow-lg rounded-3xl p-8 transition-transform duration-300 hover:scale-105">
          <div className="relative">
            <div className="absolute -z-10 -top-4 -right-4 w-16 h-16 bg-yellow-400 opacity-50 rounded-full blur-2xl"></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Нашата мисия
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Да създаваме общност, която пътува заедно, спестява ресурси и помага
            за намаляване на въглеродния отпечатък.
          </p>
        </div>

        {/* Карта 2 */}
        <div className="group bg-white shadow-lg rounded-3xl p-8 transition-transform duration-300 hover:scale-105">
          <div className="relative">
            <div className="absolute -z-10 -top-4 -left-4 w-16 h-16 bg-yellow-300 opacity-50 rounded-full blur-2xl"></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Нашите ценности
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Прозрачност, доверие и устойчивост – основите на всичко, което
            правим за нашите потребители.
          </p>
        </div>

        {/* Карта 3 */}
        <div className="group bg-white shadow-lg rounded-3xl p-8 transition-transform duration-300 hover:scale-105">
          <div className="relative">
            <div className="absolute -z-10 -bottom-4 -right-4 w-16 h-16 bg-yellow-500 opacity-50 rounded-full blur-2xl"></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Нашата визия
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Да бъдем предпочитаната платформа за споделено пътуване в региона,
            която обединява хората.
          </p>
        </div>

        {/* Карта 4 */}
        <div className="group bg-white shadow-lg rounded-3xl p-8 transition-transform duration-300 hover:scale-105">
          <div className="relative">
            <div className="absolute -z-10 -bottom-4 -left-4 w-16 h-16 bg-yellow-400 opacity-50 rounded-full blur-2xl"></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Контакт с нас
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Свържете се с нас за въпроси или предложения от страницата{" "}
            <a
              href="/contact"
              className="text-yellow-500 font-semibold hover:underline"
            >
              Контакти
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
