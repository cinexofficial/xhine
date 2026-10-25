# Product decisions

## First milestone

An expressive but calm college workspace, starting with one useful classwork loop. Website first; Android follows after the interactions have been explored with students and teachers.

- Audience: students and professors; demo reviewers can switch between both.
- Working identity: Xhine, fictional Northfield College, warm canvas, charcoal navigation, violet and lime accents.
- Routes: Overview, My classes, class detail, student-only My work.
- Two sections, two students, one teacher assigned to both. Each class includes sample subjects.
- A notice needs a title/message. An assignment needs a title/instructions/subject/class/deadline. A personal task needs a title and optionally a deadline.
- Completion is personal, reversible, and independent of a teacher's grading workflow.
- Required titles are trimmed, maximum 120 characters. Instructions/messages have a 4,000-character limit. Date-only deadlines remain local calendar dates instead of midnight UTC timestamps.
- Browser-local persistence, no real college data. Reset is explicit and confirmed. Invalid existing records are never silently replaced.
- Every visible action works. Future features aren't represented by dead navigation items.
- Desktop sidebar, phone bottom navigation, keyboard-operable native dialogs, reduced-motion support, and visible focus.

## Deliberate boundaries

Authentication, backend authorization, shared data, account invitations, assignment submission, attendance, timetable, notifications, chat, clubs, file uploads, and integrations are future work. Hosted Site access and fictional in-app account switching are separate concepts. The private Site is owner-only until the owner explicitly chooses to share it.

## Feedback session

Ask each participant to perform a task before explaining the controls:

1. Find your next assignment and explain when it's due.
2. Add a personal task and complete it.
3. Find a notice from your teacher.
4. As the teacher, share an assignment with the correct section.
5. Describe what you think “complete” means, and where you'd expect submission to live later.

Record date, participant role, task, where they hesitated, their actual words, and the proposed change. Use fictional accounts. Check with a few students and at least one teacher before expanding the scope.

## Future backlog

1. Refine navigation and classwork behavior from observed feedback.
2. Design signup, enrollment, teacher verification, and class/section selection.
3. Add a connected backend with real authentication and server-enforced classroom permissions; test access boundaries before using real records.
4. Decide assignment submission and private work workflows with teachers.
5. Plan the Android build with React Native/Expo, reusing suitable domain logic and product decisions. Web layouts and CSS aren't automatically portable.
6. Evaluate attendance, timetable, notifications, clubs, and chat individually against user needs.

Keep the backlog separate from this prototype's completion checklist.
