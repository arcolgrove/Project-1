import { notFound } from "next/navigation";
import { isSportId, SPORTS, type SportConfig } from "./sports";

export type SportParams = { params: Promise<{ sport: string }> };

/** Resolves the `[sport]` route segment to its config, or 404s. */
export async function sportFromParams({ params }: SportParams): Promise<SportConfig> {
  const { sport } = await params;
  if (!isSportId(sport)) notFound();
  return SPORTS[sport];
}
