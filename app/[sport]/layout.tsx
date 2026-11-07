import { notFound } from "next/navigation";
import { isSportId, SPORT_IDS } from "@/lib/sports";

// Only the sports in lib/sports.ts exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return SPORT_IDS.map((sport) => ({ sport }));
}

export default async function SportLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ sport: string }> }>) {
  if (!isSportId((await params).sport)) notFound();
  return children;
}
