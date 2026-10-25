import { describe, expect, it } from "vitest";
import {
  applyAction,
  assignmentsFor,
  classesFor,
  dateKey,
  noticesFor,
  parseDate,
  validDate,
  workFor,
} from "./domain";
import { createSeed } from "./seed";
const now = new Date("2026-10-25T12:00:00");
describe("classroom boundaries", () => {
  it("gives each student their own section and the teacher both", () => {
    const data = createSeed(now);
    expect(classesFor(data, "student-a").map((c) => c.id)).toEqual(["cse-a"]);
    expect(classesFor(data, "student-b").map((c) => c.id)).toEqual(["cse-b"]);
    expect(classesFor(data, "teacher")).toHaveLength(2);
  });
  it("never mixes notices and assignments between sections", () => {
    const data = createSeed(now);
    expect(
      assignmentsFor(data, "student-a").every((a) => a.classId === "cse-a"),
    ).toBe(true);
    expect(
      assignmentsFor(data, "student-b").every((a) => a.classId === "cse-b"),
    ).toBe(true);
    expect(noticesFor(data, "student-b").map((n) => n.id)).toEqual(["n-b-1"]);
  });
  it("rejects student posting and teacher posting to an unknown class", () => {
    const data = createSeed(now);
    expect(() =>
      applyAction(data, {
        type: "notice",
        classId: "cse-a",
        title: "Hello",
        message: "World",
      }),
    ).toThrow("class you teach");
    data.activeUserId = "teacher";
    expect(() =>
      applyAction(data, {
        type: "notice",
        classId: "missing",
        title: "Hello",
        message: "World",
      }),
    ).toThrow("class you teach");
  });
});
describe("the teacher-to-student journey", () => {
  it("shares an assignment only with the selected section and retains independent student progress", () => {
    let data = applyAction(createSeed(now), {
      type: "switch",
      userId: "teacher",
    });
    data = applyAction(
      data,
      {
        type: "assignment",
        classId: "cse-a",
        title: "  Interview classmates  ",
        instructions: "Bring two observations.",
        subject: "Interaction Design",
        deadline: "2026-11-01",
      },
      "new-assignment",
      now,
    );
    expect(
      assignmentsFor(data, "student-a").find((a) => a.id === "new-assignment")
        ?.title,
    ).toBe("Interview classmates");
    expect(
      assignmentsFor(data, "student-b").some((a) => a.id === "new-assignment"),
    ).toBe(false);
    data = applyAction(data, { type: "switch", userId: "student-a" });
    data = applyAction(data, {
      type: "toggle-assignment",
      id: "new-assignment",
    });
    expect(
      workFor(data, "student-a").find((a) => a.id === "new-assignment")
        ?.completed,
    ).toBe(true);
    data = applyAction(data, {
      type: "toggle-assignment",
      id: "new-assignment",
    });
    expect(
      workFor(data, "student-a").find((a) => a.id === "new-assignment")
        ?.completed,
    ).toBe(false);
  });
  it("publishes a notice and sorts it before older notices", () => {
    let data = createSeed(now);
    data.activeUserId = "teacher";
    data = applyAction(
      data,
      {
        type: "notice",
        classId: "cse-a",
        title: "Studio tomorrow",
        message: "Bring sketches.",
      },
      "new-notice",
      now,
    );
    expect(noticesFor(data, "student-a")[0].id).toBe("new-notice");
    expect(
      noticesFor(data, "student-b").some((n) => n.id === "new-notice"),
    ).toBe(false);
  });
  it("does not mutate the previous dataset", () => {
    const data = createSeed(now);
    const copy = structuredClone(data);
    applyAction(data, { type: "toggle-assignment", id: "a-design" });
    expect(data).toEqual(copy);
  });
  it("rejects progress on another section’s assignment", () => {
    expect(() =>
      applyAction(createSeed(now), {
        type: "toggle-assignment",
        id: "b-design",
      }),
    ).toThrow("not in your class");
  });
  it("does not give teachers personal progress or tasks", () => {
    const data = createSeed(now);
    data.activeUserId = "teacher";
    expect(() =>
      applyAction(data, { type: "task", title: "Plan", deadline: null }),
    ).toThrow("student accounts");
    expect(() =>
      applyAction(data, { type: "toggle-assignment", id: "a-design" }),
    ).toThrow("student accounts");
  });
});
describe("personal work", () => {
  it("keeps personal tasks private and prevents cross-account edits", () => {
    const data = applyAction(
      createSeed(now),
      { type: "task", title: "Read a paper", deadline: null },
      "private-task",
    );
    expect(
      workFor(data, "student-a").some((t) => t.id === "private-task"),
    ).toBe(true);
    expect(
      workFor(data, "student-b").some((t) => t.id === "private-task"),
    ).toBe(false);
    expect(() =>
      applyAction(data, { type: "toggle-task", id: "t-b-1" }),
    ).toThrow("unavailable");
  });
  it("supports completing and reopening a personal task", () => {
    const data = createSeed(now);
    const done = applyAction(data, { type: "toggle-task", id: "t-a-1" });
    expect(done.tasks.find((t) => t.id === "t-a-1")?.completed).toBe(true);
    expect(
      applyAction(done, { type: "toggle-task", id: "t-a-1" }).tasks.find(
        (t) => t.id === "t-a-1",
      )?.completed,
    ).toBe(false);
  });
  it("sorts unfinished work by deadline with undated tasks last", () => {
    const data = applyAction(
      createSeed(now),
      { type: "task", title: "No date", deadline: null },
      "undated",
    );
    const work = workFor(data, "student-a");
    const pending = work.filter((w) => !w.completed);
    expect(pending[0].deadline).toBe("2026-10-25");
    expect(pending.at(-1)?.id).toBe("undated");
    expect(work.at(-1)?.completed).toBe(true);
  });
});
describe("input validation and local calendar dates", () => {
  it("rejects blank and overly long titles", () => {
    const data = createSeed(now);
    expect(() =>
      applyAction(data, { type: "task", title: "   ", deadline: null }),
    ).toThrow("required");
    expect(() =>
      applyAction(data, {
        type: "task",
        title: "a".repeat(121),
        deadline: null,
      }),
    ).toThrow("120");
  });
  it("rejects impossible dates, malformed dates, and missing deadlines", () => {
    expect(validDate("2026-02-30")).toBe(false);
    expect(validDate("2026-13-01")).toBe(false);
    expect(validDate("25/10/2026")).toBe(false);
    expect(validDate("")).toBe(false);
    expect(validDate("2028-02-29")).toBe(true);
  });
  it("preserves calendar dates without UTC shifts", () => {
    expect(dateKey(parseDate("2026-10-25"))).toBe("2026-10-25");
  });
  it("requires valid instructions, subject, and deadline for an assignment", () => {
    const data = createSeed(now);
    data.activeUserId = "teacher";
    const action = {
      type: "assignment" as const,
      classId: "cse-a",
      title: "Title",
      instructions: "Instructions",
      subject: "Interaction Design",
      deadline: "2026-11-01",
    };
    expect(() => applyAction(data, { ...action, instructions: " " })).toThrow(
      "Instructions",
    );
    expect(() => applyAction(data, { ...action, subject: "Unknown" })).toThrow(
      "subject",
    );
    expect(() => applyAction(data, { ...action, deadline: "" })).toThrow(
      "deadline",
    );
  });
  it("rejects switching to an unknown account", () => {
    expect(() =>
      applyAction(createSeed(now), { type: "switch", userId: "missing" }),
    ).toThrow("unavailable");
  });
});
