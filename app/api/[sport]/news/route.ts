import { getNews } from "@/lib/news";
import { isSportId, SPORT_IDS } from "@/lib/sports";

export const revalidate = 600;
export const dynamicParams = false;

export function generateStaticParams() {
  return SPORT_IDS.map((sport) => ({ sport }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ sport: string }> }) {
  const { sport } = await params;
  if (!isSportId(sport)) return Response.json({ error: "Unknown sport" }, { status: 404 });
  return Response.json(await getNews(sport));
}
