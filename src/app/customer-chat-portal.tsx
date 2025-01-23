import { getCurrentSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { MessageWithSender } from "@/types";
import { CustomerChatWindow } from "./customer-chat-window";

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

function getUnreadMessagesCount(messages: MessageWithSender[], userId: string) {
  return messages.filter((m) => m.senderId !== userId && !m.isRead).length;
}

export async function CustomerChatPortal() {
  const { user } = await getCurrentSession();
  if (!user) return null;

  const conversation = await fetchConversation(user.id);
  let messages: MessageWithSender[] = [];
  if (conversation) {
    messages = await fetchMessages(conversation.id);
  }

  const unreadMessagesCount = getUnreadMessagesCount(messages, user.id);

  return (
    <CustomerChatWindow
      initialConversation={conversation}
      initialMessages={messages}
      initialUnreadMessagesCount={unreadMessagesCount}
    />
  );
}
