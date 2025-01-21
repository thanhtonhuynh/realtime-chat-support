import { Conversation } from "@prisma/client";

type HeaderProps = {
  conversation: Conversation & {
    customer: { name: string };
  };
};

export function Header({ conversation }: HeaderProps) {
  return (
    <header className="flex items-center gap-4 border-b p-4">
      <div className="h-12 w-12 rounded-full bg-gray-200"></div>

      <h1 className="font-semibold">{conversation.customer.name}</h1>
    </header>
  );
}
