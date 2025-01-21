"use client";

import { useState } from "react";
import { auth, db } from "../lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import CITIES from "@/lib/cities";
import { useRouter } from "next/navigation";

const CreateAdForm = () => {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [stopInput, setStopInput] = useState("");
  const [stops, setStops] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [seats, setSeats] = useState<number | string>("");
  const [car, setCar] = useState("");
  const [description, setDescription] = useState("");
  const [user] = useAuthState(auth);
  const router = useRouter();

  const MAX_STOPS = 5;

  const handleAddStop = () => {
    if (stopInput.trim() && !stops.includes(stopInput)) {
      if (stops.length < MAX_STOPS) {
        setStops([...stops, stopInput]);
        setStopInput("");
      } else {
        alert(`Можете да добавите максимум ${MAX_STOPS} спирки.`);
      }
    }
  };

  const handleRemoveStop = (stop: string) => {
    setStops(stops.filter((s) => s !== stop));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("Трябва да сте влезли в акаунта си, за да създадете обява.");
      return;
    }

    if (!start || !end || !date || !seats) {
      alert("Всички задължителни полета трябва да бъдат попълнени.");
      return;
    }

    if (Number(seats) < 1) {
      alert("Свободните места трябва да бъдат поне 1.");
      return;
    }

    if (new Date(date) < new Date()) {
      alert("Изберете валидна дата.");
      return;
    }

    try {
      const adsCollection = collection(db, "ads");
      const docRef = await addDoc(adsCollection, {
        start, // Записваме оригиналния град
        startLower: start.toLowerCase(), // Записваме града в малки букви
        end, // Записваме оригиналната крайна точка
        endLower: end.toLowerCase(), // Записваме крайната точка в малки букви
        stops: stops.map((stop) => stop), // Ако имате спирания, съхраняваме ги
        date,
        seats: Number(seats),
        car,
        description,
        userId: user.uid,
        createdAt: new Date(),
      });

      const adId = docRef.id; // Вземаме ID-то на документа
      alert("Обявата е създадена успешно!");

      // Пренасочване към страницата с детайли за обявата
      router.push(`/ad-details?id=${adId}`);

      // Нулираме полетата на формата
      setStart("");
      setEnd("");
      setStops([]);
      setDate("");
      setSeats("");
      setCar("");
      setDescription("");
    } catch (error) {
      console.error("Грешка при създаване на обява:", error);
      alert("Неуспешно създаване на обява. Опитайте отново.");
    }
  };

  return (
    <div className="p-10 mx-20 mb-20 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Създаване на обява</h2>
      <form className="grid grid-cols-2 gap-4" onSubmit={handleSubmit}>
        <div>
          <input
            list="cities"
            type="text"
            placeholder="Начална точка"
            className="p-2 border rounded w-full"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
          />
          <datalist id="cities">
            {CITIES.map((city, index) => (
              <option key={index} value={city} />
            ))}
          </datalist>
        </div>
        <div>
          <input
            list="cities"
            type="text"
            placeholder="Крайна точка"
            className="p-2 border rounded w-full"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            required
          />
          <datalist id="cities">
            {CITIES.map((city, index) => (
              <option key={index} value={city} />
            ))}
          </datalist>
        </div>
        <div className="col-span-2">
          <input
            list="cities"
            type="text"
            placeholder="Добавяне на спирка"
            className="p-2 border rounded w-full"
            value={stopInput}
            onChange={(e) => setStopInput(e.target.value)}
          />
          <button
            type="button"
            className="relative px-20 py-2 mx-auto mt-2 text-lg font-bold text-white bg-green-500 rounded-bl-xl rounded-tr-xl overflow-hidden transition-all duration-300 ease-out hover:shadow-lg group"
            onClick={handleAddStop}
          >
            <span className="z-10 relative">Добави спирка</span>
            <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-30 transform scale-0 group-hover:scale-150 transition-all duration-500 ease-out"></span>
            <span className="absolute bottom-0 left-0 w-full h-1 bg-green-300 transform scale-x-0 group-hover:scale-x-100 transition-all duration-500 ease-in-out"></span>
            <span className="absolute top-0 left-0 w-full h-full bg-green-500 opacity-20 group-hover:opacity-0 transition-all duration-500 ease-in-out"></span>
          </button>
          {stops.length > 0 && (
            <ul className="mt-4 space-y-2">
              {stops.map((stop, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center bg-gray-50 border rounded py-2 px-4 shadow"
                >
                  <span className="font-semibold text-gray-700">{stop}</span>
                  <button
                    type="button"
                    className="text-red-500 font-bold hover:underline"
                    onClick={() => handleRemoveStop(stop)}
                  >
                    Премахни
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <input
          type="date"
          className="p-2 border rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <input
          type="number"
          min="1"
          placeholder="Свободни места"
          className="p-2 border rounded"
          value={seats}
          onChange={(e) => setSeats(Number(e.target.value))}
          required
        />
        <input
          type="text"
          placeholder="Автомобил (опционално)"
          className="p-2 border rounded"
          value={car}
          onChange={(e) => setCar(e.target.value)}
        />
        <textarea
          placeholder="Описание (опционално)"
          className="p-2 border rounded col-span-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
        <button
          type="submit"
          className="relative px-20 py-2 mx-auto text-lg font-bold text-white bg-green-500 rounded-bl-xl rounded-tr-xl overflow-hidden transition-all duration-300 ease-out hover:shadow-lg group col-span-2"
        >
          <span className="z-10 relative">Създай</span>
          <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-30 transform scale-0 group-hover:scale-150 transition-all duration-500 ease-out"></span>
          <span className="absolute bottom-0 left-0 w-full h-1 bg-green-300 transform scale-x-0 group-hover:scale-x-100 transition-all duration-500 ease-in-out"></span>
          <span className="absolute top-0 left-0 w-full h-full bg-green-500 opacity-20 group-hover:opacity-0 transition-all duration-500 ease-in-out"></span>
        </button>
      </form>
    </div>
  );
};

export default CreateAdForm;
