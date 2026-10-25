import { describe, expect, it } from "vitest";
import {
  createRepository,
  isDataset,
  STORAGE_KEY,
  type StoragePort,
} from "./repository";
import { createSeed } from "./seed";
function memory() {
  const values = new Map<string, string>();
  const storage: StoragePort = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
  return { values, storage };
}
describe("persistent demo repository", () => {
  it("seeds only an empty browser and reloads saved data", () => {
    const { storage } = memory();
    const first = createRepository(storage).load();
    expect(isDataset(first)).toBe(true);
    expect(createRepository(storage).load()).toEqual(first);
  });
  it("retains a complete teacher/student/progress journey after repository recreation", () => {
    const { storage } = memory();
    let repository = createRepository(storage);
    let data = repository.load();
    data = repository.commit(data, { type: "switch", userId: "teacher" });
    data = repository.commit(data, {
      type: "assignment",
      classId: "cse-a",
      title: "Persist me",
      instructions: "Try it.",
      subject: "Interaction Design",
      deadline: "2026-12-01",
    });
    const id = data.assignments[0].id;
    data = repository.commit(data, { type: "switch", userId: "student-a" });
    repository.commit(data, { type: "toggle-assignment", id });
    repository = createRepository(storage);
    const loaded = repository.load();
    expect(loaded.activeUserId).toBe("student-a");
    expect(loaded.assignments.some((a) => a.id === id)).toBe(true);
    expect(loaded.progress.find((p) => p.assignmentId === id)?.completed).toBe(
      true,
    );
  });
  it.each(["{broken json", "{}", "null", "[]", '{"version":2}'])(
    "preserves unreadable data: %s",
    (raw) => {
      const { storage, values } = memory();
      values.set(STORAGE_KEY, raw);
      expect(() => createRepository(storage).load()).toThrow(
        "has not been changed",
      );
      expect(values.get(STORAGE_KEY)).toBe(raw);
    },
  );
  it("rejects invalid references and wrong field types rather than crashing a screen", () => {
    const data = createSeed();
    data.tasks[0].studentId = "missing";
    expect(isDataset(data)).toBe(false);
    const broken = {
      ...createSeed(),
      assignments: [{ id: "bad", instructions: 5 }],
    };
    expect(isDataset(broken)).toBe(false);
  });
  it("rejects duplicate progress records", () => {
    const data = createSeed();
    const progress = {
      studentId: "student-a",
      assignmentId: "a-design",
      completed: true,
    };
    data.progress = [progress, progress];
    expect(isDataset(data)).toBe(false);
  });
  it("reports blocked reads", () => {
    const storage: StoragePort = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {},
    };
    expect(() => createRepository(storage).load()).toThrow(
      "blocking local storage",
    );
  });
  it("reports save failure without mutating the existing in-memory snapshot", () => {
    const { storage } = memory();
    const repo = createRepository(storage);
    const data = repo.load();
    storage.setItem = () => {
      throw new Error("quota");
    };
    expect(() =>
      repo.commit(data, { type: "toggle-task", id: "t-a-1" }),
    ).toThrow("could not save");
    expect(data.tasks.find((t) => t.id === "t-a-1")?.completed).toBe(false);
  });
  it("restores samples after reset and can recover from corrupt storage", () => {
    const { storage, values } = memory();
    values.set(STORAGE_KEY, "{corrupt");
    const repo = createRepository(storage);
    const reset = repo.reset();
    expect(reset.activeUserId).toBe("student-a");
    expect(reset.progress).toEqual([]);
    expect(repo.load()).toEqual(reset);
  });
});
