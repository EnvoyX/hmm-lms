import { describe, expect, it } from "vitest";
import {
  canCreateEvents,
  canDeleteEvents,
  canEditEvents,
  canManageEventScope,
  getFilteredUniqueEvents,
  isScheduleAdmin,
} from "./schedule-helpers";

describe("getFilteredUniqueEvents", () => {
  const sampleEvent = {
    id: "evt-1",
    title: "Personal Session",
    description: null,
    start: new Date("2026-01-01T10:00:00.000Z"),
    end: new Date("2026-01-01T11:00:00.000Z"),
    allDay: false,
    color: "EMERALD" as const,
    location: null,
    userId: "user-1",
    courseId: null,
    course: null,
    createdBy: { id: "user-1", name: "Alex", email: "alex@example.com" },
  };

  it("deduplicates events by id", () => {
    const events = getFilteredUniqueEvents(
      [sampleEvent, sampleEvent],
      undefined,
      undefined,
      { personal: true, course: true, global: true },
    );

    expect(events).toHaveLength(1);
    expect(events[0]?.id).toBe("evt-1");
  });
});

describe("canManageEventScope", () => {
  it("allows admins to manage non-personal events", () => {
    const result = canManageEventScope(
      { user: { role: "ADMIN" } } as never,
      "global",
    );
    expect(result).toBe(true);
  });

  it("restricts non-admin users to personal events", () => {
    const result = canManageEventScope(
      { user: { role: "STUDENT" } } as never,
      "course",
    );
    expect(result).toBe(false);
  });
});

describe("schedule capabilities", () => {
  it("grants full capabilities to ADMIN", () => {
    const session = { user: { role: "ADMIN" } } as never;
    expect(isScheduleAdmin(session)).toBe(true);
    expect(canCreateEvents(session)).toBe(true);
    expect(canEditEvents(session)).toBe(true);
    expect(canDeleteEvents(session)).toBe(true);
  });

  it("grants full capabilities to SUPERADMIN", () => {
    const session = { user: { role: "SUPERADMIN" } } as never;
    expect(isScheduleAdmin(session)).toBe(true);
    expect(canCreateEvents(session)).toBe(true);
    expect(canEditEvents(session)).toBe(true);
    expect(canDeleteEvents(session)).toBe(true);
  });

  it("keeps STUDENT in read-only mode", () => {
    const session = { user: { role: "STUDENT" } } as never;
    expect(isScheduleAdmin(session)).toBe(false);
    expect(canCreateEvents(session)).toBe(false);
    expect(canEditEvents(session)).toBe(false);
    expect(canDeleteEvents(session)).toBe(false);
  });
});
