import { describe, expect, it } from "vitest";
import basketballRoster from "@/data/basketball-roster.json";
import footballRoster from "@/data/football-roster.json";
import { isSportId, SPORT_IDS, SPORTS } from "@/lib/sports";

describe("sports config", () => {
  it.each(SPORT_IDS)("%s has sources, terms and roster groups", (id) => {
    const sport = SPORTS[id];
    expect(sport.id).toBe(id);
    expect(sport.sources.length).toBeGreaterThan(0);
    expect(new Set(sport.sources.map((s) => s.id)).size).toBe(sport.sources.length);
    expect(sport.terms.length).toBeGreaterThan(0);
    expect(sport.markers.length).toBeGreaterThan(0);
    expect(sport.positionGroups.length).toBeGreaterThan(0);
    expect(sport.excludes.every((ex) => ex === ex.toLowerCase())).toBe(true);
  });

  it("maps every basketball position to a listed group", () => {
    for (const pos of ["G", "PG", "SG", "F", "SF", "PF", "C"]) {
      expect(SPORTS.basketball.positionGroups).toContain(SPORTS.basketball.groupOf(pos));
    }
  });

  it("maps football units to listed groups", () => {
    for (const unit of ["offense", "defense", "specialTeam"]) {
      expect(SPORTS.football.positionGroups).toContain(SPORTS.football.groupOf("QB", unit));
    }
  });

  it("sample rosters only use their sport's groups", () => {
    expect(footballRoster.every((p) => SPORTS.football.positionGroups.includes(p.positionGroup))).toBe(true);
    expect(basketballRoster.every((p) => SPORTS.basketball.positionGroups.includes(p.positionGroup))).toBe(true);
  });

  it("recognizes sport ids", () => {
    expect(isSportId("football")).toBe(true);
    expect(isSportId("basketball")).toBe(true);
    expect(isSportId("baseball")).toBe(false);
  });
});
