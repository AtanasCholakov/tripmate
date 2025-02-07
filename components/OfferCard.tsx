import { Link } from "react-router-dom";
import { auth } from "../lib/firebase"; // Импортиране на Firebase Authentication

interface OfferCardProps {
  docId: string;
  id: string;
  start: string;
  end: string;
  date: string;
  seats: number;
  car?: string; // Опционален
  description?: string; // Опционален
}

const OfferCard = ({
  docId,
  id,
  start,
  end,
  date,
  seats,
  car,
  description,
}: OfferCardProps) => {
  // Проверка дали потребителят е влязъл в профила си
  const checkLoginStatus = () => {
    const user = auth.currentUser; // Проверка дали има влязъл потребител
    if (!user) {
      window.location.href = "/register";
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-8 w-96 flex flex-col items-center">
      <h3 className="text-lg font-semibold mb-4">Начална точка: {start}</h3>
      <p>Крайна точка: {end}</p>
      <p>Дата: {date}</p>
      <p>Свободни места: {seats}</p>

      {/* Показваме бутона "Преглед" само ако потребителят не е влязъл */}
      {!auth.currentUser ? (
        <button
          onClick={checkLoginStatus}
          className="relative w-full bg-green-500 text-white font-bold py-3 mt-3 rounded-bl-xl rounded-tr-xl hover:bg-green-600 transition text-center overflow-hidden group"
        >
          <span className="relative z-10">Преглед</span>
          <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-30 transform scale-0 group-hover:scale-150 transition-all duration-500 ease-out"></span>
          <span className="absolute bottom-0 left-0 w-full h-1 bg-green-300 transform scale-x-0 group-hover:scale-x-100 transition-all duration-500 ease-in-out"></span>
          <span className="absolute top-0 left-0 w-full h-full bg-green-500 opacity-20 group-hover:opacity-0 transition-all duration-500 ease-in-out"></span>
        </button>
      ) : (
        <Link
          to={`/offer-details?id=${encodeURIComponent(
            docId
          )}&uid=${encodeURIComponent(id)}&start=${encodeURIComponent(
            start
          )}&end=${encodeURIComponent(end)}&date=${encodeURIComponent(
            date
          )}&seats=${seats}&car=${encodeURIComponent(
            car || ""
          )}&description=${encodeURIComponent(description || "")}`}
          className="w-full bg-green-500 text-white font-bold py-3 mt-3 mx-auto rounded-bl-xl rounded-tr-xl text-lg text-center relative overflow-hidden hover:bg-green-600 transition-all duration-300 transform hover:scale-105 group"
        >
          <span className="z-10 relative">Преглед</span>
          <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-30 transform scale-0 group-hover:scale-150 transition-all duration-500 ease-out"></span>
          <span className="absolute bottom-0 left-0 w-full h-1 bg-green-300 transform scale-x-0 group-hover:scale-x-100 transition-all duration-500 ease-in-out"></span>
          <span className="absolute top-0 left-0 w-full h-full bg-green-500 opacity-20 group-hover:opacity-0 transition-all duration-500 ease-in-out"></span>
        </Link>
      )}
    </div>
  );
};

export default OfferCard;
