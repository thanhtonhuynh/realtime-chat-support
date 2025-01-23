import { getConversationById } from "@/data-access/conversation";
import { getCurrentSession } from "@/lib/auth/session";
import { notFound } from "next/navigation";
import { AdminChatHeader } from "./admin-chat-header";
import { AdminChatWindow } from "./admin-chat-window";

type Params = Promise<{ conversationId: string }>;

export default async function Page(props: { params: Params }) {
  const { user } = await getCurrentSession();
  if (!user || user.role !== "admin") notFound();

  const params = await props.params;
  const conversation = await getConversationById(params.conversationId);
  if (!conversation) notFound();

  return (
    // Chat wrapper
    <div className="absolute bottom-0 left-0 right-0 top-0 flex flex-col">
      <AdminChatHeader conversation={conversation} />
      <AdminChatWindow
        conversation={conversation}
        serverMessages={conversation.messages}
        initialUnreadMessagesCount={conversation._count.messages}
      />
    </div>
  );
}
