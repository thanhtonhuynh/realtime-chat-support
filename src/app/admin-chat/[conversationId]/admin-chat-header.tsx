import { Conversation } from "@prisma/client";

type AdminChatHeaderProps = {
  conversation: Conversation & {
    customer: { name: string };
  };
};

export function AdminChatHeader({ conversation }: AdminChatHeaderProps) {
  return (
    <header className="flex items-center space-x-3 border-b p-4 py-2">
      <div className="size-10 rounded-full bg-gray-200"></div>
      <h1 className="font-semibold">{conversation.customer.name}</h1>
    </header>
  );
}
