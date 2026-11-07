import NewsFeed from "@/components/NewsFeed";
import Notice from "@/components/Notice";
import type { Metadata } from "next";
import { getNews } from "@/lib/news";
import { sportFromParams, type SportParams } from "@/lib/route-params";

export const revalidate = 600;

export async function generateMetadata(props: SportParams): Promise<Metadata> {
  return { title: `${(await sportFromParams(props)).name} News` };
}

export default async function NewsPage(props: SportParams) {
  const sport = await sportFromParams(props);
  const { items, failedSources } = await getNews(sport.id);
  const allFailed = failedSources.length === sport.sources.length;

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Latest Auburn {sport.name} News</h1>
        <p className="text-sm text-muted">
          Aggregated from {sport.sources.length} sources and refreshed every 10 minutes.
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
