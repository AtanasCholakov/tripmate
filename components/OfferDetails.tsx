"use client";
import { useSearchParams } from "react-router-dom";

const OfferDetails = () => {
  const [searchParams] = useSearchParams(); // Извличаме правилно `searchParams` от масива
  const start = searchParams.get("start") || "Не е посочено";
  const end = searchParams.get("end") || "Не е посочено";
  const date = searchParams.get("date") || "Не е посочено";
  const seats = searchParams.get("seats") || "Не е посочено";

  return (
    <div className="bg-white shadow-lg rounded-lg p-8 max-w-4xl mx-auto mt-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Лява колона */}
        <div className="flex-1">
          <h2 className="text-yellow-500 text-lg font-bold">Начална точка</h2>
          <p className="text-gray-800 mb-4">{start}</p>

          <h2 className="text-yellow-500 text-lg font-bold">Крайна точка</h2>
          <p className="text-gray-800 mb-4">{end}</p>

          <h2 className="text-yellow-500 text-lg font-bold">Дата</h2>
          <p className="text-gray-800 mb-4">{date}</p>

          <h2 className="text-yellow-500 text-lg font-bold">Свободни места</h2>
          <p className="text-gray-800 mb-4">{seats}</p>
        </div>

        {/* Дясна колона */}
        <div className="flex-shrink-0 w-full lg:w-72 flex flex-col items-center bg-gray-50 p-6 rounded-lg shadow-md">
          <div className="w-32 h-32 rounded-full border-2 border-yellow-500 flex items-center justify-center text-gray-500 text-6xl">
            👤
          </div>
          <h3 className="text-gray-800 text-xl font-bold mt-4">Иван Иванов</h3>
          <div className="flex items-center mt-2">
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
