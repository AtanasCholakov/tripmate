"use client";

import { useState } from "react";
import { auth, db } from "../lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import CITIES from "@/lib/cities";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MAX_LOCATION_LENGTH,
  MAX_STOPS,
  MAX_SEATS,
  MAX_CAR_NAME_LENGTH,
  MAX_DESCRIPTION_LENGTH,
} from "../lib/constants";

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

  const handleAddStop = () => {
    if (
      stopInput.trim() &&
      !stops.includes(stopInput) &&
      stops.length < MAX_STOPS
    ) {
      setStops([...stops, stopInput]);
      setStopInput("");
    } else if (stops.length >= MAX_STOPS) {
      alert(`Можете да добавите максимум ${MAX_STOPS} спирки.`);
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

    if (start.toLowerCase() === end.toLowerCase()) {
      alert("Началната и крайната точка не могат да бъдат еднакви.");
      return;
    }

    if (
      start.length > MAX_LOCATION_LENGTH ||
      end.length > MAX_LOCATION_LENGTH
    ) {
      alert(
        `Началната и крайната точка трябва да са не повече от ${MAX_LOCATION_LENGTH} символа.`
      );
      return;
    }

    const seatsNumber = Number(seats);
    if (seatsNumber < 1 || seatsNumber > MAX_SEATS) {
      alert(`Свободните места трябва да бъдат между 1 и ${MAX_SEATS}.`);
      return;
    }

    if (new Date(date) < new Date()) {
      alert("Изберете валидна дата.");
      return;
    }

    if (car && car.length > MAX_CAR_NAME_LENGTH) {
      alert(
        `Името на автомобила трябва да е не повече от ${MAX_CAR_NAME_LENGTH} символа.`
      );
      return;
    }

    if (description && description.length > MAX_DESCRIPTION_LENGTH) {
      alert(
        `Описанието трябва да е не повече от ${MAX_DESCRIPTION_LENGTH} символа.`
      );
      return;
    }

    try {
      const adsCollection = collection(db, "ads");
      const docRef = await addDoc(adsCollection, {
        start,
        startLower: start.toLowerCase(),
        end,
        endLower: end.toLowerCase(),
        stops: stops.map((stop) => stop),
        date,
        seats: seatsNumber,
        car,
        description,
        userId: user.uid,
        createdAt: new Date(),
      });

      const adId = docRef.id;
      alert("Обявата е създадена успешно!");

      router.push(
        `/offer-details?id=${encodeURIComponent(adId)}&uid=${encodeURIComponent(
          user.uid
        )}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(
          end
        )}&date=${encodeURIComponent(date)}&seats=${encodeURIComponent(
          seats.toString()
        )}&car=${encodeURIComponent(
          car || ""
        )}&description=${encodeURIComponent(description || "")}`
      );

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-10 mx-20 mb-20 bg-white shadow rounded-lg"
    >
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-2xl font-bold mb-4"
      >
        Създаване на обява
      </motion.h2>
      <form className="grid grid-cols-2 gap-4" onSubmit={handleSubmit}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <input
            list="cities"
            type="text"
            placeholder="Начална точка"
            className="p-2 border rounded w-full"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
            maxLength={MAX_LOCATION_LENGTH}
          />
          <datalist id="cities">
            {CITIES.map((city, index) => (
              <option key={index} value={city} />
            ))}
          </datalist>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <input
            list="cities"
            type="text"
            placeholder="Крайна точка"
            className="p-2 border rounded w-full"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            required
            maxLength={MAX_LOCATION_LENGTH}
          />
          <datalist id="cities">
            {CITIES.map((city, index) => (
              <option key={index} value={city} />
            ))}
          </datalist>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="col-span-2"
        >
          <input
            list="cities"
            type="text"
            placeholder="Добавяне на спирка"
            className="p-2 border rounded w-full"
            value={stopInput}
            onChange={(e) => setStopInput(e.target.value)}
            maxLength={MAX_LOCATION_LENGTH}
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
          <AnimatePresence>
            {stops.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 space-y-2"
              >
                {stops.map((stop, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
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
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </motion.div>
        <motion.input
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          type="date"
          className="p-2 border rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <motion.input
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          type="number"
          min="1"
          max={MAX_SEATS}
          placeholder={`Свободни места (1-${MAX_SEATS})`}
          className="p-2 border rounded"
          value={seats}
          onChange={(e) => setSeats(Number(e.target.value))}
          required
        />
        <motion.input
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          type="text"
          placeholder="Автомобил (опционално)"
          className="p-2 border rounded"
          value={car}
          onChange={(e) => setCar(e.target.value)}
          maxLength={MAX_CAR_NAME_LENGTH}
        />
        <motion.textarea
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          placeholder="Описание (опционално)"
          className="p-2 border rounded col-span-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={MAX_DESCRIPTION_LENGTH}
        ></motion.textarea>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          type="submit"
          className="relative px-20 py-2 mx-auto text-lg font-bold text-white bg-green-500 rounded-bl-xl rounded-tr-xl overflow-hidden transition-all duration-300 ease-out hover:shadow-lg group col-span-2"
        >
          <span className="z-10 relative">Създай</span>
          <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-30 transform scale-0 group-hover:scale-150 transition-all duration-500 ease-out"></span>
          <span className="absolute bottom-0 left-0 w-full h-1 bg-green-300 transform scale-x-0 group-hover:scale-x-100 transition-all duration-500 ease-in-out"></span>
          <span className="absolute top-0 left-0 w-full h-full bg-green-500 opacity-20 group-hover:opacity-0 transition-all duration-500 ease-in-out"></span>
        </motion.button>
      </form>
    </motion.div>
  );
};

export default CreateAdForm;
