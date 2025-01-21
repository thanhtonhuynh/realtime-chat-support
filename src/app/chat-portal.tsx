import { getCurrentSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { MessageWithSender } from "@/types";
import { ChatWindow } from "./chat-window";

async function fetchConversation(userId: string) {
  return await prisma.conversation.findUnique({
    where: { customerId: userId },
  });
}

async function fetchMessages(conversationId: string | undefined) {
  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: {
      sender: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return messages;
}

export async function ChatPortal() {
  const { user } = await getCurrentSession();
  if (!user) return null;

  const conversation = await fetchConversation(user.id);
  let messages: MessageWithSender[] = [];
  if (conversation) {
    messages = await fetchMessages(conversation.id);
  }

  return <ChatWindow serverConversation={conversation} serverMessages={messages} />;
}
