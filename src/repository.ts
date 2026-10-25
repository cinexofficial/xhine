import { applyAction, validDate, type Action, type Dataset } from "./domain";
import { createSeed } from "./seed";
export const STORAGE_KEY = "xhine.workspace.v1";
export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function strings(value: Record<string, unknown>, keys: string[]) {
  return keys.every(
    (key) =>
      typeof value[key] === "string" && (value[key] as string).length > 0,
  );
}
export function isDataset(value: unknown): value is Dataset {
  if (
    !record(value) ||
    value.version !== 1 ||
    typeof value.activeUserId !== "string"
  )
    return false;
  const arrays = [
    "users",
    "classes",
    "memberships",
    "notices",
    "assignments",
    "tasks",
    "progress",
  ];
  if (
    !arrays.every(
      (key) =>
        Array.isArray(value[key]) && (value[key] as unknown[]).every(record),
    )
  )
    return false;
  const data = value as unknown as Dataset;
  if (!data.users.length || !data.classes.length) return false;
  if (
    !data.users.every(
      (user) =>
        strings(user as unknown as Record<string, unknown>, [
          "id",
          "name",
          "initials",
          "subtitle",
        ]) && ["student", "teacher"].includes(user.role),
    )
  )
    return false;
  if (
    !data.classes.every(
      (group) =>
        strings(group as unknown as Record<string, unknown>, [
          "id",
          "name",
          "section",
          "code",
        ]) &&
        ["violet", "peach"].includes(group.color) &&
        Array.isArray(group.subjects) &&
        group.subjects.length > 0 &&
        group.subjects.every(
          (subject) => typeof subject === "string" && subject.length > 0,
        ),
    )
  )
    return false;
  const users = new Map(data.users.map((user) => [user.id, user]));
  const classes = new Set(data.classes.map((group) => group.id));
  const assignments = new Map(data.assignments.map((item) => [item.id, item]));
  if (!users.has(data.activeUserId)) return false;
  for (const key of [
    "users",
    "classes",
    "notices",
    "assignments",
    "tasks",
  ] as const)
    if (new Set(data[key].map((item) => item.id)).size !== data[key].length)
      return false;
  const enrolled = (userId: string, classId: string) =>
    data.memberships.some(
      (item) => item.userId === userId && item.classId === classId,
    );
  if (
    !data.memberships.every(
      (item) => users.has(item.userId) && classes.has(item.classId),
    )
  )
    return false;
  if (
    !data.notices.every(
      (item) =>
        strings(item as unknown as Record<string, unknown>, [
          "id",
          "title",
          "message",
          "createdAt",
        ]) &&
        Number.isFinite(Date.parse(item.createdAt)) &&
        classes.has(item.classId) &&
        users.get(item.authorId)?.role === "teacher" &&
        enrolled(item.authorId, item.classId),
    )
  )
    return false;
  if (
    !data.assignments.every(
      (item) =>
        strings(item as unknown as Record<string, unknown>, [
          "id",
          "title",
          "instructions",
          "subject",
          "deadline",
          "createdAt",
        ]) &&
        validDate(item.deadline) &&
        Number.isFinite(Date.parse(item.createdAt)) &&
        classes.has(item.classId) &&
        users.get(item.authorId)?.role === "teacher" &&
        enrolled(item.authorId, item.classId) &&
        data.classes
          .find((group) => group.id === item.classId)!
          .subjects.includes(item.subject),
    )
  )
    return false;
  if (
    !data.tasks.every(
      (item) =>
        strings(item as unknown as Record<string, unknown>, ["id", "title"]) &&
        users.get(item.studentId)?.role === "student" &&
        typeof item.completed === "boolean" &&
        (item.deadline === null ||
          (typeof item.deadline === "string" && validDate(item.deadline))),
    )
  )
    return false;
  if (
    !data.progress.every(
      (item) =>
        users.get(item.studentId)?.role === "student" &&
        assignments.has(item.assignmentId) &&
        enrolled(item.studentId, assignments.get(item.assignmentId)!.classId) &&
        typeof item.completed === "boolean",
    )
  )
    return false;
  return (
    new Set(
      data.progress.map((item) => `${item.studentId}/${item.assignmentId}`),
    ).size === data.progress.length
  );
}
export function createRepository(storage: StoragePort) {
  const save = (data: Dataset) => {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      throw new Error(
        "Your browser could not save this change. Free some storage or allow site data, then try again.",
      );
    }
    return data;
  };
  return {
    load(): Dataset {
      let raw: string | null;
      try {
        raw = storage.getItem(STORAGE_KEY);
      } catch {
        throw new Error(
          "Your browser is blocking local storage. Allow site data and retry.",
        );
      }
      if (raw === null) return save(createSeed());
      try {
        const parsed: unknown = JSON.parse(raw);
        if (!isDataset(parsed)) throw new Error();
        return parsed;
      } catch {
        throw new Error(
          "We could not read your saved workspace. Your saved data has not been changed. You can retry or reset to the sample workspace.",
        );
      }
    },
    commit(data: Dataset, action: Action) {
      return save(applyAction(data, action));
    },
    reset() {
      return save(createSeed());
    },
  };
}
