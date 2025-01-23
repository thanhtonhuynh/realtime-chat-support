import { getCurrentSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import "server-only";

export async function getConversationById(conversationId: string) {
  const { user } = await getCurrentSession();
  if (!user) throw new Error("User not found");

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
      _count: {
        select: {
          messages: {
            where: {
              senderId: { not: user.id },
              isRead: false,
            },
          },
        },
      },
    },
  });
}

export async function getAdminConversations() {
  const { user } = await getCurrentSession();
  if (!user) throw new Error("User not found");

  const conversations = await prisma.conversation.findMany({
    select: {
      id: true,
      createdAt: true,

      customer: { select: { name: true } },
      messages: { take: 1, orderBy: { createdAt: "desc" } },
      _count: {
        select: {
          messages: {
            where: {
              senderId: { not: user.id },
              isRead: false,
            },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return conversations;
}
