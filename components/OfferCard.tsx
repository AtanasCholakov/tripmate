interface OfferCardProps {
  start: string;
  end: string;
  date: string;
  seats: number;
}

const OfferCard = ({ start, end, date, seats }: OfferCardProps) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-8 w-96 flex flex-col items-center">
      <h3 className="text-lg font-semibold mb-4">Начална точка: {start}</h3>
      <p>Крайна точка: {end}</p>
      <p>Дата: {date}</p>
      <p>Свободни места: {seats}</p>
      <p>Автомобил: Седан</p>
      <div className="my-4 text-center">
        <p className="font-semibold text-lg mb-2">Иван Иванов</p>
        <span className="text-yellow-400 text-lg">★★★★★</span>
      </div>
      <button className="w-full bg-green-500 text-white font-bold py-3 rounded-bl-xl rounded-tr-xl hover:bg-green-600 transition">
        Преглед
      </button>
    </div>
  );
};

export default OfferCard;
