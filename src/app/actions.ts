"use server";

import { getCurrentSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

export async function createConversation(customerId: string) {
  const { user } = await getCurrentSession();
  if (!user) throw new Error("User not found");

  return await prisma.conversation.create({
    data: { customerId },
  });
}

export async function createMessage(
  id: string,
  conversationId: string,
  senderId: string,
  content: string,
) {
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return await prisma.message.create({
    data: {
      id,
      conversationId,
      senderId,
      content,
    },
    include: {
      sender: { select: { id: true, name: true } },
    },
  });
}

export async function markLastMessageRead(conversationId: string) {
  const { user } = await getCurrentSession();
  if (!user) throw new Error("User not found");

  const message = await prisma.message.findFirst({
    where: {
      conversationId,
      senderId: { not: user.id },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!message) return;

  return await prisma.message.update({
    where: { id: message.id },
    data: { isRead: true },
  });
}
