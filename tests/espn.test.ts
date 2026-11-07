import { afterEach, describe, expect, it, vi } from "vitest";
import { getRoster, getSchedule, normalizeRoster, normalizeSchedule } from "@/lib/espn";

const rosterPayload = {
  athletes: [
    {
      position: "offense",
      items: [
        {
          id: "101",
          fullName: "Test Quarterback",
          jersey: "10",
          position: { abbreviation: "QB" },
          experience: { displayValue: "Junior" },
          displayHeight: "6' 3\"",
          displayWeight: "215 lbs",
          birthPlace: { city: "Mobile", state: "AL" },
          headshot: { href: "https://a.espncdn.com/101.png" },
        },
      ],
    },
    { position: "specialTeam", items: [{ id: "102", fullName: "Test Kicker", position: { abbreviation: "PK" } }] },
  ],
};

const team = (id: string, name: string) => ({ id, displayName: name, logos: [{ href: `https://logo/${id}.png` }] });

const schedulePayload = {
  events: [
    {
      id: "g2",
      date: "2026-10-17T23:00Z",
      timeValid: true,
      competitions: [
        {
          venue: { fullName: "Jordan-Hare Stadium", address: { city: "Auburn", state: "AL" } },
          broadcasts: [{ media: { shortName: "ESPN" } }],
          status: { type: { state: "pre" } },
          competitors: [
            { id: "2", homeAway: "home", team: team("2", "Auburn Tigers") },
            { id: "99", homeAway: "away", team: team("99", "Rival U") },
          ],
        },
      ],
    },
    {
      id: "g1",
      date: "2026-10-10T16:00Z",
      competitions: [
        {
          status: { type: { state: "post", completed: true } },
          competitors: [
            { id: "50", homeAway: "home", team: team("50", "Road Team"), score: { value: 17 } },
            { id: "2", homeAway: "away", team: team("2", "Auburn Tigers"), score: { value: 24 }, winner: true },
          ],
        },
      ],
    },
  ],
};

describe("normalizeRoster", () => {
  it("maps ESPN athletes into players", () => {
    const players = normalizeRoster(rosterPayload, "football");
    expect(players).toHaveLength(2);
    expect(players[0]).toMatchObject({
      name: "Test Quarterback",
      number: "10",
      position: "QB",
      positionGroup: "Offense",
      classYear: "Junior",
      hometown: "Mobile, AL",
    });
    expect(players[1].positionGroup).toBe("Special Teams");
  });

  it("rejects unexpected payloads", () => {
    expect(() => normalizeRoster({}, "football")).toThrow();
  });
});

describe("normalizeRoster (basketball)", () => {
  it("reads ESPN's flat basketball roster and groups by position", () => {
    const payload = {
      athletes: [
        { id: "1", fullName: "Test Guard", jersey: "3", position: { abbreviation: "G" } },
        { id: "2", fullName: "Test Forward", jersey: "21", position: { abbreviation: "F" } },
        { id: "3", fullName: "Test Center", jersey: "50", position: { abbreviation: "C" } },
      ],
    };
    const players = normalizeRoster(payload, "basketball");
    expect(players.map((p) => [p.name, p.positionGroup])).toEqual([
      ["Test Guard", "Guards"],
      ["Test Forward", "Forwards"],
      ["Test Center", "Centers"],
    ]);
  });
});

describe("normalizeSchedule", () => {
  it("sorts games and derives results from Auburn's perspective", () => {
    const games = normalizeSchedule(schedulePayload);
    expect(games.map((g) => g.id)).toEqual(["g1", "g2"]);
    expect(games[0]).toMatchObject({
      opponent: "Road Team",
      homeAway: "away",
      status: "final",
      result: { auburnScore: 24, opponentScore: 17, win: true },
    });
    expect(games[1]).toMatchObject({
      opponent: "Rival U",
      homeAway: "home",
      venue: "Jordan-Hare Stadium · Auburn, AL",
      tv: "ESPN",
      status: "scheduled",
      timeTbd: false,
    });
    expect(games[1].result).toBeUndefined();
  });
});

describe("fallback", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("serves bundled sample data when ESPN is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const [roster, schedule] = await Promise.all([getRoster("football"), getSchedule("football")]);
    expect(roster.isFallback).toBe(true);
    expect(roster.data.length).toBeGreaterThan(0);
    expect(schedule.isFallback).toBe(true);
  });

  it("serves basketball sample data from the basketball endpoint's fallback", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const roster = await getRoster("basketball");
    expect(String(fetchMock.mock.calls[0][0])).toContain("/basketball/mens-college-basketball/teams/2/roster");
    expect(roster.isFallback).toBe(true);
    expect(roster.data.every((p) => ["Guards", "Forwards", "Centers"].includes(p.positionGroup))).toBe(true);
  });

  it("uses live data when ESPN responds", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json(rosterPayload)));
    const roster = await getRoster("football");
    expect(roster.isFallback).toBe(false);
    expect(roster.data[0].name).toBe("Test Quarterback");
  });
});
