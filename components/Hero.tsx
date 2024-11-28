import Link from "next/link";

const Hero = () => {
  return (
    <div
      className="relative h-[400px] bg-cover bg-center"
      style={{ backgroundImage: "url('/images/hero-image.png')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-center items-center text-center text-white">
        <h1 className="text-4xl font-bold">TripMate</h1>
        <p className="text-xl mt-2">Сподели пътя, намали емисиите!</p>
        <Link href="/Register">
          <button className="bg-green-500 text-white px-6 py-2 rounded-bl-xl rounded-tr-xl mt-4 text-lg font-bold">
            Започни сега →
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Hero;
