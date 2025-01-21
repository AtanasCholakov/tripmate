import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UserProfileView from "@/components/UserProfileView";

export default function UserProfilePage({
  params,
}: {
  params: { userId: string };
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <UserProfileView userId={params.userId} />
      </main>
      <Footer />
    </div>
  );
}
