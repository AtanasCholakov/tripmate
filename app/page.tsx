import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import OfferCard from "@/components/OfferCard";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <section className="py-10 bg-gray-100">
        <h2 className="text-center text-3xl font-bold text-gray-800">
          Готови за път? Виж най-добрите оферти!
        </h2>
        <div className="flex justify-center gap-8 mt-8 px-4">
          <OfferCard start="София" end="Пловдив" date="25.11.2024" seats={3} />
          <OfferCard start="Варна" end="Бургас" date="26.11.2024" seats={2} />
          <OfferCard start="Русе" end="София" date="27.11.2024" seats={4} />
        </div>
      </section>
      <HowItWorks />
      <Footer />
    </div>
  );
}

export default Home;
