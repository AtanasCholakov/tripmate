"use client";

import { useState } from "react";
import { auth, db } from "../lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import CITIES from "@/lib/cities";

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

    if (!start || !end || !date || !seats || !car) {
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
      await addDoc(adsCollection, {
        start: start.toLowerCase(),
        end: end.toLowerCase(),
        stops: stops.map((stop) => stop.toLowerCase()),
        date,
        seats: Number(seats),
        car,
        description,
        createdBy: {
          uid: user.uid,
          email: user.email,
        },
        createdAt: new Date(),
      });

      alert("Обявата е създадена успешно!");
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
          <datalist id="cities">
            {CITIES.map((city, index) => (
              <option key={index} value={city} />
            ))}
          </datalist>
          <button
            type="button"
            className="bg-green-500 text-white px-20 py-2 mx-auto rounded-bl-xl rounded-tr-xl text-lg font-bold hover:bg-green-600 transition mt-2"
            onClick={handleAddStop}
          >
            Добави спирка
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
          {stops.length === MAX_STOPS && (
            <p className="text-red-500 font-semibold mt-2">
              Достигнат е максималният брой спирки ({MAX_STOPS}).
            </p>
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
          placeholder="Автомобил"
          className="p-2 border rounded"
          value={car}
          onChange={(e) => setCar(e.target.value)}
          required
        />
        <textarea
          placeholder="Описание (опционално)"
          className="p-2 border rounded col-span-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
        <button
          type="submit"
          className="bg-green-500 text-white px-20 py-2 mx-auto rounded-bl-xl rounded-tr-xl text-lg font-bold hover:bg-green-600 transition duration-300 col-span-2"
        >
          Създай
        </button>
      </form>
    </div>
  );
};

export default CreateAdForm;
