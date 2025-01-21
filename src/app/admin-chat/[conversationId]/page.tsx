import { getConversationById } from "@/data-access/conversation";
import { notFound } from "next/navigation";
import { ChatWindow } from "./chat-window";
import { Header } from "./header";

type Params = Promise<{ conversationId: string }>;

export default async function Page(props: { params: Params }) {
  const params = await props.params;
  const conversation = await getConversationById(params.conversationId);
  if (!conversation) notFound();

  return (
    // Chat window wrapper
    <div className="absolute bottom-0 left-0 right-0 top-0 flex flex-col">
      {/* Chat header */}
      <Header conversation={conversation} />

      <ChatWindow conversation={conversation} serverMessages={conversation.messages} />
    </div>
  );
}
