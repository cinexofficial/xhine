# Xhine

Your campus, a little closer. A responsive, browser-local prototype of a student and teacher classwork hub.

## Run it

Repository: [cinexofficial/xhine](https://github.com/cinexofficial/xhine) (private).

For a step-by-step guide for your friend's computer, including installation, downloading the project, and sharing a preview on the same Wi-Fi, see [docs/LOCAL_SETUP.md](docs/LOCAL_SETUP.md).

Install **Node.js 24** and **pnpm 11.25.0** on each developer's machine. Use separate GitHub accounts. From a new terminal:

```sh
npm install --global pnpm@11.25.0
git clone https://github.com/cinexofficial/xhine.git
cd xhine
pnpm install --frozen-lockfile
pnpm dev
```

Open the Local URL printed in the terminal (usually `http://127.0.0.1:5173`). Keep the terminal open while using the site. Source lives in `src/`; don't edit generated `dist/` files.

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm preview
```

The lockfile keeps both developers on the same dependency versions. Only esbuild's required install script is allowed in `pnpm-workspace.yaml`. Fonts are bundled locally, so the interface doesn't depend on a font CDN. No API keys, database, or environment variables are needed.

## Try the full story

1. Open **Demo · Student** in the header and choose **Dr. Mira Sen**.
2. Choose **Create assignment**. Select Section A, add a title and instructions, and choose a date or **In a week**. Share the assignment.
3. Switch to **Alex Morgan**. Open **My work** or **My classes → Computer Science**. Find the assignment and mark it complete.
4. Refresh. Open **My work → Completed** to see the saved progress. Reopen it whenever you want.
5. Switch to **Jamie Lee**. Section A assignments and Alex's personal tasks won't appear in Jamie's Section B workspace.
6. As the teacher, post a notice from the Overview or a class's **Notices** tab. Switch to that section's student to read it.
7. Add a personal task with or without a deadline. Check it off, reopen it, or filter work by type.
8. Use search to find class content and tasks. Press Escape to close a dialog. Use Tab and Shift+Tab to navigate its controls.

**Reset:** Open **Made for the everyday** in the footer (or the sidebar's first-time help), then **Reset demo**. Confirm to restore sample accounts and relative dates.

## What's real in this prototype

Posting, classroom filtering, account switching, search, personal tasks, completion, and persistence work. Records are stored under `xhine.workspace.v1` in this browser's `localStorage`. Each browser/origin has an independent copy; the local preview and hosted Site won't share data. Changes are committed to the UI only after saving succeeds. Unreadable saved data is preserved until the user explicitly confirms reset.

The accounts and college are fictional. Switching accounts is a demo feature, **not authentication or a security boundary**. Checking an assignment complete tracks personal progress, not submission. There is no server, cross-device sync, actual attendance, timetable, grading, chat, clubs, file upload, or notification delivery.

## Code map

- `src/domain.ts`: typed records, visibility selectors, work sorting, date validation, and pure mutation rules.
- `src/seed.ts`: fictional users, two sections, class content, and personal tasks. Dates are relative to first launch/reset.
- `src/repository.ts`: versioned persistence, shape/reference validation, and storage failures. A future backend replaces this boundary.
- `src/state.tsx`: React provider, loading/recovery states, save-before-render commits, and feedback.
- `src/App.tsx`: routes, workspace layout, student/teacher screens, forms, and dialogs.
- `src/ui.tsx`: shared interface components. `tokens.css`, `styles.css`, and `accessibility.css` define the visual system, responsive layouts, and contrast adjustments.
- `src/*.test.ts`: domain and repository acceptance scenarios.

Hash routes work on static hosting without special rewrite rules. A production build outputs `dist/`. The original publishing machine's `.openai/hosting.json` holds the private Sites identity and is excluded from Git; preserve that local file when publishing updates. Running locally doesn't need it.

## Working together

Use the private [cinexofficial/xhine](https://github.com/cinexofficial/xhine) repository. Add the other person's GitHub username as a collaborator; don't share passwords or accounts. Create a GitHub Projects board with **To do → In progress → Review → Done** and copy the starter tasks from [docs/COLLABORATION.md](docs/COLLABORATION.md). Collaborator invitations and a project board have not been provisioned automatically.

Each task has one owner and an acceptance condition. Start a short-lived branch from current `main`, commit small changes, push it, and open a pull request. The other person reviews and runs the relevant checks before merging. Use the included PR template. Agree on an owner before both editing shared data types or design tokens.

Pair on the first complete teacher-to-student flow. Then divide student Overview/My Work and teacher classroom/forms work. Have one weekly demonstration call. Write down decisions and blockers. AI-generated changes receive the same human review and testing as any other change.

See [docs/PRODUCT.md](docs/PRODUCT.md) for scope, design decisions, feedback prompts, and the future app path.
