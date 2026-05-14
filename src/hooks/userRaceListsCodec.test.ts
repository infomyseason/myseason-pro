import { describe, expect, it } from "vitest"
import { userRaceListsFromRow } from "./userRaceListsCodec"

describe("userRaceListsFromRow", () => {
  it("hydrates Supabase snake_case season columns", () => {
    const lists = userRaceListsFromRow({
      planned_race_ids: ["race-planned"],
      completed_race_ids: ["race-completed"],
      calendar_entries: [
        {
          raceId: "race-calendar",
          selectedDistance: "10K",
          goalType: "aRace",
          userNote: "Target race",
          addedAt: "2026-05-14T11:00:00.000Z",
        },
      ],
    })

    expect(lists).toEqual({
      plannedRaceIds: ["race-planned"],
      completedRaceIds: ["race-completed"],
      calendarEntries: [
        {
          raceId: "race-calendar",
          selectedDistance: "10K",
          goalType: "aRace",
          userNote: "Target race",
          addedAt: "2026-05-14T11:00:00.000Z",
        },
      ],
    })
  })

  it("keeps legacy camelCase rows readable", () => {
    const lists = userRaceListsFromRow({
      plannedRaceIds: ["legacy-planned"],
      completedRaceIds: ["legacy-completed"],
      calendarEntries: [
        {
          raceId: "legacy-calendar",
          selectedDistance: "Sprint",
          addedAt: "2026-05-14T11:00:00.000Z",
        },
      ],
    })

    expect(lists.plannedRaceIds).toEqual(["legacy-planned"])
    expect(lists.completedRaceIds).toEqual(["legacy-completed"])
    expect(lists.calendarEntries).toEqual([
      {
        raceId: "legacy-calendar",
        selectedDistance: "Sprint",
        addedAt: "2026-05-14T11:00:00.000Z",
      },
    ])
  })
})
