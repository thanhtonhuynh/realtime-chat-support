import { Message, Prisma } from "@prisma/client";

export type MessageWithSender = Prisma.MessageGetPayload<{
  include: {
    sender: {
      select: { id: true; name: true };
    };
  };
}>;

export type AdminConversation = Prisma.ConversationGetPayload<{
  select: {
    id: true;
    createdAt: true;
    customer: { select: { name: true } };
    messages: {
      take: 1;
      orderBy: { createdAt: "desc" };
    };
    _count: {
      select: {
        messages: {
          where: {
            senderId: { not: string };
            isRead: boolean;
          };
        };
      };
    };
  };
}>;

export type ReshapedConversation = {
  id: string;
  createdAt: Date;
  customer: { name: string };
  unreadMessagesCount: number;
  latestMessage: Message | null;
};
