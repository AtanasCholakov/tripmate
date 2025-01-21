import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatPage from "@/components/ChatPage";

export default async function ChatPageWrapper({
  params,
  searchParams,
}: {
  params: { userId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const initialUserId =
    params.userId || (searchParams.userId as string) || undefined;

  return (
    <div className="flex flex-col min-h-screen bg-yellow-50">
      <Navbar />
      <main className="flex-grow">
        <ChatPage initialUserId={initialUserId} />
      </main>
      <Footer />
    </div>
  );
}
