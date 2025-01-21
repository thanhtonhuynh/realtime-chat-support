import { getConversations } from "@/data-access/conversation";
import { ConversationProvider } from "@/providers/conversation-provider";
import { AdminConversation, ReshapedConversation } from "@/types";
import Link from "next/link";
import { ConversationList } from "./conversation-list";

function reshapeConversations(conversations: AdminConversation[]): ReshapedConversation[] {
  return conversations.map((conversation) => ({
    id: conversation.id,
    createdAt: conversation.createdAt,
    latestMessage: conversation.messages[0],
    customerName: conversation.customer.name,
  }));
}

export default async function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  const conversations = await getConversations();
  const reshapedConversations = reshapeConversations(conversations);

  return (
    <ConversationProvider>
      <div className="flex flex-col gap-2 p-4">
        <Link href={`/admin-chat`} className="mx-auto w-fit text-2xl font-extrabold">
          Admin Chat
        </Link>

        {/* Container */}
        <div className="flex h-[calc(100vh-12rem)] rounded-xl border">
          {/* Left sidebar */}
          <div className="w-full max-w-96 border-r p-4">
            <p className="mb-2 text-lg font-bold">Conversations</p>
            <ConversationList initialConversations={reshapedConversations} />
          </div>

          {/* Right panel - main chat window */}
          <div className="relative flex-1">{children}</div>
        </div>
      </div>
    </ConversationProvider>
  );
}
