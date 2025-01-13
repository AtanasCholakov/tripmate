"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import CITIES from "@/lib/cities";
import { useRouter } from "next/navigation";

interface EditAdFormProps {
  adId: string; // ID на обявата за редактиране
}

const EditAdForm: React.FC<EditAdFormProps> = ({ adId }) => {
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

  const MAX_STOPS = 5;

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
      alert("Трябва да сте влезли в акаунта си, за да редактирате обява.");
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
      const adRef = doc(db, "ads", adId);
      await updateDoc(adRef, {
        start,
        startLower: start.toLowerCase(),
        end,
        endLower: end.toLowerCase(),
        stops,
        date,
        seats: Number(seats),
        car,
        description,
        updatedAt: new Date(),
      });

      alert("Обявата е успешно редактирана.");
      router.push(`/ad-details?id=${adId}`);
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
            className="bg-green-500 text-white px-8 py-2 mx-auto rounded-bl-xl rounded-tr-xl text-lg font-bold hover:bg-green-600 transition mt-2"
            onClick={handleAddStop}
          >
            Добави спирка
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
            placeholder="Свободни места"
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
          />
        </div>
        <div className="w-full md:w-1/2">
          <textarea
            placeholder="Описание (опционално)"
            className="p-2 border rounded w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
        <button
          type="submit"
          className="bg-green-500 text-white px-8 py-2 mx-auto rounded-bl-xl rounded-tr-xl text-lg font-bold hover:bg-green-600 transition duration-300 mt-4"
        >
          Запази
        </button>
      </form>
    </div>
  );
};

export default EditAdForm;
