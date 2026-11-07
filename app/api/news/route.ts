import { getNews } from "@/lib/news";

export const revalidate = 600;

/** Football feed; kept for existing links. Other sports use /api/[sport]/news. */
export async function GET() {
  return Response.json(await getNews("football"));
}
