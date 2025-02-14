"use client";

import { useEffect, useState } from "react";
import { auth, db, onAuthStateChanged } from "../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import CITIES from "@/lib/cities";
import { useRouter } from "next/navigation";
import {
  MAX_LOCATION_LENGTH,
  MAX_STOPS,
  MAX_SEATS,
  MAX_CAR_NAME_LENGTH,
  MAX_DESCRIPTION_LENGTH,
} from "../lib/constants";
import type React from "react";

interface AdData {
  start: string;
  end: string;
  date: string;
  seats: number;
  car?: string;
  description?: string;
  userId: string;
}

interface EditAdFormProps {
  adId: string;
  onAdUpdate: (updatedAdId: string, adData: AdData) => void;
}

const EditAdForm: React.FC<EditAdFormProps> = ({ adId, onAdUpdate }) => {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [stopInput, setStopInput] = useState("");
  const [stops, setStops] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [seats, setSeats] = useState<number | string>("");
  const [car, setCar] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [user] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = "/";
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchAdData = async () => {
      if (!adId) return;

      try {
        const adRef = doc(db, "ads", adId);
        const adDoc = await getDoc(adRef);

        if (adDoc.exists()) {
          const adData = adDoc.data();
          setStart(adData.start || "");
          setEnd(adData.end || "");
          setStops(adData.stops || []);
          setDate(adData.date || "");
          setSeats(adData.seats || "");
          setCar(adData.car || "");
          setDescription(adData.description || "");
        } else {
          alert("Обявата не съществува.");
          router.push("/my-listings");
        }
      } catch (error) {
        console.error("Грешка при зареждане на обявата:", error);
        alert("Неуспешно зареждане на обявата.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdData();
  }, [adId, router]);

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
      alert("Трябва да сте влезли в акаунта си, за да редактирате обява.");
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
      const adRef = doc(db, "ads", adId);
      await updateDoc(adRef, {
        start,
        startLower: start.toLowerCase(),
        end,
        endLower: end.toLowerCase(),
        stops,
        date,
        seats: seatsNumber,
        car,
        description,
        updatedAt: new Date(),
      });

      alert("Обявата е успешно редактирана.");
      onAdUpdate(adId, {
        start,
        end,
        date,
        seats: seatsNumber,
        car,
        description,
        userId: user?.uid || "",
      });
    } catch (error) {
      console.error("Грешка при редактиране на обявата:", error);
      alert("Неуспешно редактиране на обявата. Опитайте отново.");
    }
  };

  if (loading) {
    return <p>Зареждане на обявата...</p>;
  }

  return (
    <div className="p-10 mx-20 mb-20 bg-white shadow-lg rounded-lg w-full max-w-full flex flex-col gap-6">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Редактиране на обявата
      </h2>
      <form className="grid grid-cols-2 gap-6 w-full" onSubmit={handleSubmit}>
        <div>
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
            maxLength={MAX_LOCATION_LENGTH}
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
            maxLength={MAX_LOCATION_LENGTH}
          />
          <button
            type="button"
            className="bg-green-500 text-white px-8 py-2 mx-auto rounded-bl-xl rounded-tr-xl text-lg font-bold hover:bg-green-600 transition mt-2 relative overflow-hidden group"
            onClick={handleAddStop}
          >
            <span className="relative z-10">Добави спирка</span>
            <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-30 transform scale-0 group-hover:scale-150 transition-all duration-500 ease-out"></span>
            <span className="absolute bottom-0 left-0 w-full h-1 bg-green-300 transform scale-x-0 group-hover:scale-x-100 transition-all duration-500 ease-in-out"></span>
            <span className="absolute top-0 left-0 w-full h-full bg-green-500 opacity-20 group-hover:opacity-0 transition-all duration-500 ease-in-out"></span>
          </button>
          {stops.length > 0 && (
            <ul className="mt-6 space-y-3">
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
        <div>
          <input
            type="date"
            className="p-2 border rounded w-full"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="number"
            min="1"
            max={MAX_SEATS}
            placeholder={`Свободни места (1-${MAX_SEATS})`}
            className="p-2 border rounded w-full"
            value={seats}
            onChange={(e) => setSeats(Number(e.target.value))}
            required
          />
        </div>
        <div className="w-full md:w-1/2">
          <input
            type="text"
            placeholder="Автомобил (опционално)"
            className="p-2 border rounded w-full"
            value={car}
            onChange={(e) => setCar(e.target.value)}
            maxLength={MAX_CAR_NAME_LENGTH}
          />
        </div>
        <div className="w-full md:w-1/2">
          <textarea
            placeholder="Описание (опционално)"
            className="p-2 border rounded w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={MAX_DESCRIPTION_LENGTH}
          ></textarea>
        </div>
        <div className="col-span-2 flex justify-center mt-6">
          <button
            type="submit"
            className="bg-green-500 text-white px-12 py-3 rounded-bl-xl rounded-tr-xl text-xl font-bold hover:bg-green-600 transition duration-300 relative overflow-hidden group"
          >
            <span className="relative z-10">Запази</span>
            <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-30 transform scale-0 group-hover:scale-150 transition-all duration-500 ease-out"></span>
            <span className="absolute bottom-0 left-0 w-full h-1 bg-green-300 transform scale-x-0 group-hover:scale-x-100 transition-all duration-500 ease-in-out"></span>
            <span className="absolute top-0 left-0 w-full h-full bg-green-500 opacity-20 group-hover:opacity-0 transition-all duration-500 ease-in-out"></span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAdForm;
