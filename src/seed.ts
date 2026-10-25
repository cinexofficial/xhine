import { dateKey, type Dataset } from "./domain";
export function createSeed(now = new Date()): Dataset {
  const day = (offset: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() + offset);
    return dateKey(date);
  };
  const posted = (hours: number) =>
    new Date(now.getTime() - hours * 3600000).toISOString();
  return {
    version: 1,
    activeUserId: "student-a",
    users: [
      {
        id: "student-a",
        name: "Alex Morgan",
        initials: "AM",
        role: "student",
        subtitle: "Computer Science · Section A",
      },
      {
        id: "student-b",
        name: "Jamie Lee",
        initials: "JL",
        role: "student",
        subtitle: "Computer Science · Section B",
      },
      {
        id: "teacher",
        name: "Dr. Mira Sen",
        initials: "MS",
        role: "teacher",
        subtitle: "Professor · Computer Science",
      },
    ],
    classes: [
      {
        id: "cse-a",
        name: "Computer Science",
        section: "Year 2 · Section A",
        code: "CSE / A",
        subjects: [
          "Interaction Design",
          "Data Structures",
          "Computer Networks",
        ],
        color: "violet",
      },
      {
        id: "cse-b",
        name: "Computer Science",
        section: "Year 2 · Section B",
        code: "CSE / B",
        subjects: [
          "Interaction Design",
          "Data Structures",
          "Computer Networks",
        ],
        color: "peach",
      },
    ],
    memberships: [
      { userId: "student-a", classId: "cse-a" },
      { userId: "student-b", classId: "cse-b" },
      { userId: "teacher", classId: "cse-a" },
      { userId: "teacher", classId: "cse-b" },
    ],
    assignments: [
      {
        id: "a-design",
        classId: "cse-a",
        authorId: "teacher",
        title: "A better everyday experience",
        subject: "Interaction Design",
        instructions:
          "Find a small friction in your daily campus life. Interview two classmates, sketch three possible solutions, and choose one to develop. Bring your sketches and a short explanation of your design decisions to class.",
        deadline: day(1),
        createdAt: posted(20),
      },
      {
        id: "a-data",
        classId: "cse-a",
        authorId: "teacher",
        title: "Make sense of the connections",
        subject: "Data Structures",
        instructions:
          "Model the campus paths as a graph. Implement breadth-first search and explain the shortest route between two buildings with a worked example.",
        deadline: day(3),
        createdAt: posted(40),
      },
      {
        id: "a-network",
        classId: "cse-a",
        authorId: "teacher",
        title: "Inside a network request",
        subject: "Computer Networks",
        instructions:
          "Trace what happens when you open a website. Create an annotated diagram covering DNS, TCP, TLS, and HTTP. Include a brief description of each stage.",
        deadline: day(5),
        createdAt: posted(60),
      },
      {
        id: "b-design",
        classId: "cse-b",
        authorId: "teacher",
        title: "Design for a first-time visitor",
        subject: "Interaction Design",
        instructions:
          "Design a simple wayfinding experience for someone visiting campus for the first time. Include a journey map and three wireframes.",
        deadline: day(2),
        createdAt: posted(16),
      },
    ],
    notices: [
      {
        id: "n-a-1",
        classId: "cse-a",
        authorId: "teacher",
        title: "A small change of scenery",
        message:
          "Our next Interaction Design session will be in the design studio, Room 204. Bring your sketchbook and your most curious questions.",
        createdAt: posted(2),
      },
      {
        id: "n-a-2",
        classId: "cse-a",
        authorId: "teacher",
        title: "Your next idea starts with a conversation",
        message:
          "Office hours are open on Wednesday, 2–4 PM. Drop by if you want to talk through your project or untangle a tricky concept.",
        createdAt: posted(25),
      },
      {
        id: "n-b-1",
        classId: "cse-b",
        authorId: "teacher",
        title: "Section B · Studio reminder",
        message:
          "Bring your first-time visitor journey maps to our next session. We will share feedback in small groups.",
        createdAt: posted(5),
      },
    ],
    tasks: [
      {
        id: "t-a-1",
        studentId: "student-a",
        title: "Read up on design thinking",
        deadline: day(0),
        completed: false,
      },
      {
        id: "t-a-2",
        studentId: "student-a",
        title: "Find two people to interview",
        deadline: day(1),
        completed: false,
      },
      {
        id: "t-a-3",
        studentId: "student-a",
        title: "Organize this week’s notes",
        deadline: day(0),
        completed: true,
      },
      {
        id: "t-b-1",
        studentId: "student-b",
        title: "Walk the campus visitor route",
        deadline: day(1),
        completed: false,
      },
    ],
    progress: [],
  };
}
