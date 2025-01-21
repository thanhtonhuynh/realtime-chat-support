import { getCurrentSession } from "@/lib/auth/session";
import { ChatPortal } from "./chat-portal";

export default async function Home() {
  const { user } = await getCurrentSession();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <p className="text-2xl font-extrabold">Realtime Chat Customer Support</p>

      {user && user.role !== "admin" && <ChatPortal />}
    </div>
  );
}
