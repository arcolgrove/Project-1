import NewsFeed from "@/components/NewsFeed";
import Notice from "@/components/Notice";
import { getNews } from "@/lib/news";
import { NEWS_SOURCES } from "@/lib/sources";

export const revalidate = 600;

export default async function NewsPage() {
  const { items, failedSources } = await getNews();
  const allFailed = failedSources.length === NEWS_SOURCES.length;

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Latest Auburn Football News</h1>
        <p className="text-sm text-muted">
          Aggregated from {NEWS_SOURCES.length} sources and refreshed every 10 minutes.
        </p>
      </div>
      {allFailed ? (
        <Notice>News sources are unreachable right now. Please try again in a few minutes.</Notice>
      ) : (
        failedSources.length > 0 && <Notice>Some sources didn&apos;t respond: {failedSources.join(", ")}.</Notice>
      )}
      <NewsFeed items={items} />
    </>
  );
}
