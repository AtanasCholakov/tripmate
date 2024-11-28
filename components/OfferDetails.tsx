"use client";

const OfferDetails = () => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-8 max-w-4xl mx-auto mt-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Лява колона */}
        <div className="flex-1">
          <h2 className="text-yellow-500 text-lg font-bold">Начална точка</h2>
          <p className="text-gray-800 mb-4">Пловдив</p>

          <h2 className="text-yellow-500 text-lg font-bold">Крайна точка</h2>
          <p className="text-gray-800 mb-4">София</p>

          <h2 className="text-yellow-500 text-lg font-bold">Крайна точка</h2>
          <p className="text-gray-800 mb-4">
            Спирка1, Спирка2, Спирка3, Спирка4
          </p>

          <h2 className="text-yellow-500 text-lg font-bold">Дата</h2>
          <p className="text-gray-800 mb-4">20.11.2024</p>

          <h2 className="text-yellow-500 text-lg font-bold">Свободни места</h2>
          <p className="text-gray-800 mb-4">3</p>

          <h2 className="text-yellow-500 text-lg font-bold">Автомобил</h2>
          <p className="text-gray-800 mb-4">Volkswagen Golf 6</p>

          <h2 className="text-yellow-500 text-lg font-bold">Услуги</h2>
          <p className="text-gray-800 mb-4">
            Багаж, домашни любимци, пушене, музика
          </p>

          <h2 className="text-yellow-500 text-lg font-bold">
            Допълнителна информация
          </h2>
          <p className="text-gray-800">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>

        {/* Дясна колона */}
        <div className="flex-shrink-0 w-full lg:w-72 flex flex-col items-center bg-gray-50 p-6 rounded-lg shadow-md">
          <div className="w-32 h-32 rounded-full border-2 border-yellow-500 flex items-center justify-center text-gray-500 text-6xl">
            👤
          </div>
          <h3 className="text-gray-800 text-xl font-bold mt-4">Иван Иванов</h3>
          <div className="flex items-center mt-2">
            {/* Икони със звезди */}
            <span className="text-yellow-500 text-lg">★★★★★</span>
          </div>
          <button className="mt-4 bg-green-500 text-white font-bold py-2 px-6 rounded-tr-xl rounded-bl-xl hover:bg-green-600 transition-all">
            Изпрати съобщение
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfferDetails;
