import { redirect } from "next/navigation";

export default async function ChatIdRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/conversation/${id}`);
}
