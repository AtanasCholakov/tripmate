const Footer = () => {
  return (
    <footer className="bg-yellow-500 p-8 text-white">
      <div className="flex justify-between flex-wrap">
        <img
          src="/images/logo.png"
          alt="TripMate Logo"
          className="h-20 w-auto"
        />
        <h2 className="font-bold mb-4">TripMate © 2024</h2>
        <div className="flex space-x-12">
          {/* Навигация */}
          <nav className="flex flex-col space-y-2">
            <a href="#" className="hover:underline">
              Начало
            </a>
            <a href="/about-us" className="hover:underline">
              За нас
            </a>
            <a href="/contact" className="hover:underline">
              Контакти
            </a>
            <a href="/faq" className="hover:underline">
              Често задавани въпроси
            </a>
          </nav>
          {/* Социални икони */}
          <div className="flex flex-col space-y-2">
            <a href="#" className="hover:opacity-80">
              <img
                src="/images/facebook-icon.png"
                alt="Facebook"
                className="h-8 w-8"
              />
            </a>
            <a href="#" className="hover:opacity-80">
              <img
                src="/images/instagram-icon.png"
                alt="Instagram"
                className="h-8 w-8"
              />
            </a>
            <a href="#" className="hover:opacity-80">
              <img
                src="/images/twitter-icon.png"
                alt="Twitter"
                className="h-8 w-8"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
