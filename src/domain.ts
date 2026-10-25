export type Role = "student" | "teacher";
export interface User {
  id: string;
  name: string;
  role: Role;
  initials: string;
  subtitle: string;
}
export interface Classroom {
  id: string;
  name: string;
  section: string;
  code: string;
  subjects: string[];
  color: "violet" | "peach";
}
export interface Membership {
  userId: string;
  classId: string;
}
export interface Notice {
  id: string;
  classId: string;
  authorId: string;
  title: string;
  message: string;
  createdAt: string;
}
export interface Assignment {
  id: string;
  classId: string;
  authorId: string;
  title: string;
  instructions: string;
  subject: string;
  deadline: string;
  createdAt: string;
}
export interface PersonalTask {
  id: string;
  studentId: string;
  title: string;
  deadline: string | null;
  completed: boolean;
}
export interface Progress {
  studentId: string;
  assignmentId: string;
  completed: boolean;
}
export interface Dataset {
  version: 1;
  activeUserId: string;
  users: User[];
  classes: Classroom[];
  memberships: Membership[];
  notices: Notice[];
  assignments: Assignment[];
  tasks: PersonalTask[];
  progress: Progress[];
}
export type Action =
  | { type: "switch"; userId: string }
  | { type: "notice"; classId: string; title: string; message: string }
  | {
      type: "assignment";
      classId: string;
      title: string;
      instructions: string;
      subject: string;
      deadline: string;
    }
  | { type: "task"; title: string; deadline: string | null }
  | { type: "toggle-task"; id: string }
  | { type: "toggle-assignment"; id: string };
export interface WorkItem {
  id: string;
  kind: "assignment" | "task";
  title: string;
  subject: string;
  deadline: string | null;
  completed: boolean;
  classId?: string;
}

export function dateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function parseDate(value: string) {
  return new Date(`${value}T12:00:00`);
}
export function validDate(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(parseDate(value).getTime()) &&
    dateKey(parseDate(value)) === value
  );
}
export function activeUser(data: Dataset) {
  return data.users.find((user) => user.id === data.activeUserId)!;
}
export function classesFor(data: Dataset, userId: string) {
  return data.classes.filter((group) =>
    data.memberships.some(
      (member) => member.userId === userId && member.classId === group.id,
    ),
  );
}
export function assignmentsFor(data: Dataset, userId: string) {
  const ids = new Set(classesFor(data, userId).map((group) => group.id));
  return data.assignments.filter((item) => ids.has(item.classId));
}
export function noticesFor(data: Dataset, userId: string) {
  const ids = new Set(classesFor(data, userId).map((group) => group.id));
  return data.notices
    .filter((item) => ids.has(item.classId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export function workFor(data: Dataset, userId: string): WorkItem[] {
  const assignments: WorkItem[] = assignmentsFor(data, userId).map((item) => ({
    id: item.id,
    kind: "assignment",
    title: item.title,
    subject: item.subject,
    deadline: item.deadline,
    classId: item.classId,
    completed: data.progress.some(
      (p) =>
        p.studentId === userId && p.assignmentId === item.id && p.completed,
    ),
  }));
  const tasks: WorkItem[] = data.tasks
    .filter((item) => item.studentId === userId)
    .map((item) => ({ ...item, kind: "task", subject: "Personal task" }));
  return [...assignments, ...tasks].sort(
    (a, b) =>
      Number(a.completed) - Number(b.completed) ||
      (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999") ||
      a.title.localeCompare(b.title),
  );
}
function required(value: string, name: string, max: number) {
  const clean = value.trim();
  if (!clean) throw new Error(`${name} is required.`);
  if (clean.length > max)
    throw new Error(`${name} must be ${max} characters or fewer.`);
  return clean;
}
export function applyAction(
  data: Dataset,
  action: Action,
  id: string = crypto.randomUUID(),
  now = new Date(),
): Dataset {
  const user = activeUser(data);
  const next = structuredClone(data);
  if (action.type === "switch") {
    if (!data.users.some((item) => item.id === action.userId))
      throw new Error("That demo account is unavailable.");
    next.activeUserId = action.userId;
    return next;
  }
  if (action.type === "notice" || action.type === "assignment") {
    if (
      user.role !== "teacher" ||
      !classesFor(data, user.id).some((group) => group.id === action.classId)
    )
      throw new Error("Choose a class you teach.");
    const base = {
      id,
      classId: action.classId,
      authorId: user.id,
      title: required(action.title, "Title", 120),
      createdAt: now.toISOString(),
    };
    if (action.type === "notice")
      next.notices.unshift({
        ...base,
        message: required(action.message, "Message", 4000),
      });
    else {
      if (!validDate(action.deadline))
        throw new Error("Choose a valid deadline.");
      const group = data.classes.find((item) => item.id === action.classId)!;
      if (!group.subjects.includes(action.subject))
        throw new Error("Choose a subject from this class.");
      next.assignments.unshift({
        ...base,
        instructions: required(action.instructions, "Instructions", 4000),
        deadline: action.deadline,
        subject: action.subject,
      });
    }
    return next;
  }
  if (user.role !== "student")
    throw new Error("Personal work belongs to student accounts.");
  if (action.type === "task") {
    if (action.deadline !== null && !validDate(action.deadline))
      throw new Error("Choose a valid deadline.");
    next.tasks.push({
      id,
      studentId: user.id,
      title: required(action.title, "Task title", 120),
      deadline: action.deadline,
      completed: false,
    });
  } else if (action.type === "toggle-task") {
    const task = next.tasks.find(
      (item) => item.id === action.id && item.studentId === user.id,
    );
    if (!task) throw new Error("That personal task is unavailable.");
    task.completed = !task.completed;
  } else {
    if (!assignmentsFor(data, user.id).some((item) => item.id === action.id))
      throw new Error("That assignment is not in your class.");
    const progress = next.progress.find(
      (item) => item.studentId === user.id && item.assignmentId === action.id,
    );
    if (progress) progress.completed = !progress.completed;
    else
      next.progress.push({
        studentId: user.id,
        assignmentId: action.id,
        completed: true,
      });
  }
  return next;
}
