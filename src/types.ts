import { Message, Prisma } from "@prisma/client";

export type MessageWithSender = Prisma.MessageGetPayload<{
  include: {
    sender: {
      select: { id: true; name: true };
    };
  };
}>;

export type AdminConversation = Prisma.ConversationGetPayload<{
  include: {
    customer: { select: { name: true } };
    messages: { take: 1; orderBy: { createdAt: "desc" } };
  };
}>;

export type ReshapedConversation = {
  id: string;
  createdAt: Date;
  customerName: string;
  latestMessage: Message;
};
