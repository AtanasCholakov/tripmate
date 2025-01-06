import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  // Проверка дали потребителят е влязъл в профила си
  const checkLoginStatus = () => {
    const user = auth.currentUser; // Проверка дали има влязъл потребител
    if (!user) {
      // Ако няма влязъл потребител, пренасочваме към страницата за логин
      navigate("/register"); // Можете да промените на пътя за регистрация, ако е нужно
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
          onClick={checkLoginStatus} // Проверка за логин при клик
          className="w-full bg-green-500 text-white font-bold py-3 mt-3 rounded-bl-xl rounded-tr-xl hover:bg-green-600 transition text-center"
        >
          Преглед
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
          className="w-full bg-green-500 text-white font-bold py-3 mt-3 rounded-bl-xl rounded-tr-xl hover:bg-green-600 transition text-center"
        >
          Преглед
        </Link>
      )}
    </div>
  );
};

export default OfferCard;
