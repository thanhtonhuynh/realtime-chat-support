import prisma from "@/lib/prisma";
import "server-only";

export async function getConversationById(conversationId: string) {
  return await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        include: {
          sender: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      customer: { select: { name: true } },
    },
  });
}

export async function getConversations() {
  const conversations = await prisma.conversation.findMany({
    include: {
      customer: { select: { name: true } },
      messages: { take: 1, orderBy: { createdAt: "desc" } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return conversations;
}
