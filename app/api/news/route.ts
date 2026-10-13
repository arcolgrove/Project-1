import { getNews } from "@/lib/news";

export const revalidate = 600;

export async function GET() {
  return Response.json(await getNews());
}
