import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <ContactForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
