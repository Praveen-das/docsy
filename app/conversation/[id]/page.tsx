import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getConversation } from "@/services/conversation.service";

export default async function DynamicConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const { id } = await params;
  try {
    const conv = await getConversation(userId, id);
    if (!conv || !conv.documentIds || conv.documentIds.length === 0) {
      redirect(`/conversation?conv=${id}`);
    }

    const docId = conv.documentIds[0];
    redirect(`/conversation?doc=${docId}&conv=${id}`);
  } catch {
    redirect(`/conversation?conv=${id}`);
  }
}
