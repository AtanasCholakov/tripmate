import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="bg-yellow-500 p-4 flex justify-between items-center">
      <Link href="/">
        <img
          src="/images/logo.png"
          alt="TripMate Logo"
          className="h-20 w-auto"
        />
      </Link>
      <div>
        <Link href="/Login">
          <button className="bg-white text-yellow-500 px-4 py-2 rounded-bl-xl rounded-tr-xl mr-2 font-bold">
            Вход
          </button>
        </Link>
        <Link href="/register">
          <button className="bg-green-500 text-white px-4 py-2 rounded-bl-xl rounded-tr-xl font-bold">
            Регистрация
          </button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
