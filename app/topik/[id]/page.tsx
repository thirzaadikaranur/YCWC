import { TopicPage } from "@/components/TopicPage";

export default async function TopicRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TopicPage key={id} topicId={id} />;
}
