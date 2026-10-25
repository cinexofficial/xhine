import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  Clock3,
  GraduationCap,
  LayoutDashboard,
  ListTodo,
  LoaderCircle,
  Megaphone,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import {
  activeUser,
  assignmentsFor,
  classesFor,
  noticesFor,
  parseDate,
  workFor,
  type Action,
  type Assignment,
  type Dataset,
  type Notice,
  type User,
  type WorkItem,
} from "./domain";
import { useWorkspace } from "./state";
import {
  ArrowLink,
  Art,
  Breadcrumb,
  Button,
  Completion,
  DeadlineField,
  Due,
  Empty,
  IconButton,
  Modal,
  SectionHeading,
  SubjectIcon,
  dueLabel,
} from "./ui";

type Dialog =
  | { kind: "accounts" }
  | { kind: "reset" }
  | { kind: "help" }
  | { kind: "search" }
  | { kind: "task" }
  | { kind: "assignment"; id: string }
  | { kind: "notice"; id: string }
  | { kind: "post-assignment"; classId?: string }
  | { kind: "post-notice"; classId?: string };
interface AppContextValue {
  data: Dataset;
  user: User;
  open(dialog: Dialog): void;
  act(action: Action, message?: string): boolean;
}
const AppContext = createContext<AppContextValue | null>(null);
function useApp() {
  return useContext(AppContext)!;
}
const links = [
  { path: "/", label: "Overview", icon: LayoutDashboard },
  { path: "/classes", label: "My classes", icon: BookOpen },
  { path: "/work", label: "My work", icon: ListTodo },
];

export default function App() {
  const workspace = useWorkspace();
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => {
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [location.pathname]);
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setDialog({ kind: "search" });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const act = (action: Action, message?: string) => {
    try {
      const result = workspace.dispatch(action, message);
      setError("");
      return result;
    } catch (caught) {
      setError((caught as Error).message);
      return false;
    }
  };
  if (workspace.loading)
    return (
      <div className="boot-screen">
        <div className="brand-mark">x</div>
        <LoaderCircle className="spin" />
        <p>Getting your campus together…</p>
      </div>
    );
  if (workspace.loadError || !workspace.data)
    return (
      <div className="boot-screen">
        <div className="brand-mark">x</div>
        <h1>Let’s get you back on track.</h1>
        <p role="alert">{workspace.loadError}</p>
        <div className="button-row">
          <Button onClick={workspace.retry}>Retry loading</Button>
          <Button secondary onClick={() => setDialog({ kind: "reset" })}>
            Reset sample workspace
          </Button>
        </div>
        {dialog?.kind === "reset" && (
          <Modal title="Start fresh?" onClose={() => setDialog(null)}>
            <p className="modal-copy">
              Reset removes this browser’s saved demo and restores the fictional
              accounts and sample work.
            </p>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <Button
              onClick={() => {
                try {
                  workspace.reset();
                  setDialog(null);
                  setError("");
                  navigate("/");
                } catch (caught) {
                  setError((caught as Error).message);
                }
              }}
            >
              Restore sample workspace
            </Button>
          </Modal>
        )}
      </div>
    );
  const data = workspace.data;
  const user = activeUser(data);
  const close = () => setDialog(null);
  return (
    <AppContext.Provider value={{ data, user, open: setDialog, act }}>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          mainRef.current?.focus();
          mainRef.current?.scrollIntoView();
        }}
      >
        Skip to content
      </a>
      <div className="app-shell">
        <aside className="sidebar" aria-label="Main navigation">
          <NavLink to="/" className="brand" aria-label="Xhine home">
            <span className="brand-mark">x</span>
            <span>
              xhine<span className="brand-dot">.</span>
            </span>
          </NavLink>
          <div className="campus-label">
            <span className="campus-symbol">
              <GraduationCap size={18} />
            </span>
            <div>
              <strong>Northfield College</strong>
              <span>Your campus, connected</span>
            </div>
          </div>
          <p className="nav-caption">YOUR WORKSPACE</p>
          <nav>
            {links
              .filter(
                (link) => user.role === "student" || link.path !== "/work",
              )
              .map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === "/"}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                >
                  <link.icon size={19} />
                  <span>{link.label}</span>
                  {link.path === "/work" && (
                    <span className="nav-badge">
                      {
                        workFor(data, user.id).filter((item) => !item.completed)
                          .length
                      }
                    </span>
                  )}
                </NavLink>
              ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="sidebar-note">
              <span className="note-star">✳</span>
              <p>
                A little structure.
                <br />
                <strong>A lot of possibility.</strong>
              </p>
              <span>Your next big idea belongs here.</span>
            </div>
            <button
              className="sidebar-help"
              onClick={() => setDialog({ kind: "help" })}
            >
              <CircleHelp size={18} />
              <span>Around here for the first time?</span>
              <ArrowUpRight size={16} />
            </button>
            <button
              className="sidebar-account"
              onClick={() => setDialog({ kind: "accounts" })}
            >
              <span
                className={`avatar ${user.role === "teacher" ? "avatar-peach" : ""}`}
              >
                {user.initials}
              </span>
              <span>
                <strong>{user.name}</strong>
                <small>
                  {user.role === "student"
                    ? "Student workspace"
                    : "Teacher workspace"}
                </small>
              </span>
              <ChevronDown size={16} />
            </button>
          </div>
        </aside>
        <div className="workspace-shell">
          <header className="topbar">
            <div className="topbar-context">
              <span className="mobile-brand">
                xhine<span>.</span>
              </span>
              <span className="desktop-context">
                Workspace <span>/</span>{" "}
                {location.pathname.startsWith("/classes")
                  ? "My classes"
                  : location.pathname === "/work"
                    ? "My work"
                    : "Overview"}
              </span>
            </div>
            <div className="topbar-actions">
              <button
                aria-label="Search workspace"
                className="search-trigger"
                onClick={() => setDialog({ kind: "search" })}
              >
                <Search size={17} />
                <span>Find something</span>
                <kbd>⌘ K</kbd>
              </button>
              <span className="today">
                <CalendarDays size={15} />
                {new Date().toLocaleDateString("en", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <button
                className="demo-switch"
                onClick={() => setDialog({ kind: "accounts" })}
              >
                <span className="status-dot" />
                <span>
                  Demo · {user.role === "student" ? "Student" : "Teacher"}
                </span>
                <ChevronDown size={14} />
              </button>
              <button
                className={`avatar top-avatar ${user.role === "teacher" ? "avatar-peach" : ""}`}
                aria-label="Switch demo account"
                onClick={() => setDialog({ kind: "accounts" })}
              >
                {user.initials}
              </button>
            </div>
          </header>
          <main ref={mainRef} id="main-content" tabIndex={-1}>
            {error && (
              <div className="error-banner" role="alert">
                <span>{error}</span>
                <IconButton label="Dismiss error" onClick={() => setError("")}>
                  <X size={18} />
                </IconButton>
              </div>
            )}
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/classes" element={<ClassList />} />
              <Route path="/classes/:classId" element={<ClassDetail />} />
              <Route
                path="/work"
                element={
                  user.role === "student" ? (
                    <MyWork />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <footer className="workspace-footer">
            <span>
              <span className="status-dot" />A little closer to your campus.
            </span>
            <button onClick={() => setDialog({ kind: "help" })}>
              Made for the everyday <Sparkles size={12} />
            </button>
          </footer>
        </div>
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {links
            .filter((link) => user.role === "student" || link.path !== "/work")
            .map((link) => (
              <NavLink key={link.path} to={link.path} end={link.path === "/"}>
                <link.icon size={20} />
                <span>{link.label}</span>
              </NavLink>
            ))}
        </nav>
      </div>
      <div
        className={`toast ${workspace.toast ? "toast-visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {workspace.toast && (
          <>
            <CheckCheck size={18} />
            {workspace.toast}
          </>
        )}
      </div>
      {dialog && <Dialogs dialog={dialog} close={close} />}
    </AppContext.Provider>
  );
}

function Dashboard() {
  const { data, user, open } = useApp();
  const navigate = useNavigate();
  const student = user.role === "student";
  const assignments = assignmentsFor(data, user.id);
  const work = student ? workFor(data, user.id) : [];
  const pending = work.filter((item) => !item.completed);
  const upcoming = student
    ? pending.filter((item) => item.kind === "assignment")
    : assignments
        .map((item) => ({
          ...item,
          kind: "assignment" as const,
          completed: false,
        }))
        .sort((a, b) => a.deadline.localeCompare(b.deadline));
  const featured = upcoming[0];
  const notices = noticesFor(data, user.id);
  const groups = classesFor(data, user.id);
  const openAssignments = pending.filter(
    (item) => item.kind === "assignment",
  ).length;
  return (
    <div className="page dashboard">
      <div className="page-intro">
        <div>
          <p className="eyebrow">
            <span className="tiny-star">✳</span> YOUR CAMPUS, IN SYNC
          </p>
          <h1>
            Hey {student ? user.name.split(" ")[0] : "Dr. Sen"},{" "}
            <span className="greeting-rest">
              make today count<span className="violet-text">.</span>
            </span>
          </h1>
          <p className="page-subtitle">
            {student
              ? "A little clarity for everything on your plate. Let’s get into it."
              : "Good ideas start in your classroom. Give them a place to grow."}
          </p>
        </div>
        <Button
          secondary
          onClick={() =>
            open(student ? { kind: "task" } : { kind: "post-assignment" })
          }
        >
          <Plus size={17} />
          {student ? "Add a task" : "Create assignment"}
        </Button>
      </div>
      <div className="dashboard-columns">
        <div className="dashboard-main">
          <section className="hero">
            <div className="hero-copy">
              <span className="hero-tag">
                <span className="status-dot" />
                {student
                  ? "A LITTLE FOCUS GOES A LONG WAY"
                  : "A SPACE FOR WHAT’S NEXT"}
              </span>
              <h2>
                {student ? (
                  <>
                    Small steps.
                    <br />
                    Big possibilities.
                  </>
                ) : (
                  <>
                    Great classes.
                    <br />
                    Brighter ideas.
                  </>
                )}
              </h2>
              <p>
                {student
                  ? "You bring the curiosity. We’ll keep the rest together."
                  : "Bring your class together, one idea at a time."}
              </p>
              <button
                className="hero-action"
                onClick={() =>
                  featured
                    ? open({ kind: "assignment", id: featured.id })
                    : student
                      ? navigate("/work")
                      : open({ kind: "post-assignment" })
                }
              >
                {featured ? (
                  <>
                    <span>
                      <small>
                        {student
                          ? "YOUR NEXT ASSIGNMENT"
                          : "NEXT CLASS DEADLINE"}
                      </small>
                      <strong>{featured.title}</strong>
                    </span>
                    <ArrowUpRight size={22} />
                  </>
                ) : (
                  <>
                    <span>
                      <small>
                        {student ? "LOOK AT YOU GO" : "LET’S GET STARTED"}
                      </small>
                      <strong>
                        {student
                          ? "You’re all caught up"
                          : "Create your first assignment"}
                      </strong>
                    </span>
                    <ArrowUpRight size={22} />
                  </>
                )}
              </button>
            </div>
            <Art teacher={!student} />
            <div className="hero-bottom">
              <span>
                {featured
                  ? dueLabel(featured.deadline)
                  : "A fresh page. A new possibility."}
              </span>
              <span>KEEP GOING, YOU’VE GOT THIS ↗</span>
            </div>
          </section>
          <div className="stats-grid">
            <Stat
              icon={ClipboardList}
              value={student ? openAssignments : assignments.length}
              label={student ? "Assignments to do" : "Assignments shared"}
              detail={student ? "One step at a time" : "Ideas in motion"}
              color="violet"
              onClick={() => navigate(student ? "/work" : "/classes")}
            />
            <Stat
              icon={student ? ListTodo : Users}
              value={
                student
                  ? pending.filter((item) => item.kind === "task").length
                  : groups.length
              }
              label={student ? "Personal tasks" : "Classes you teach"}
              detail={
                student
                  ? "A little space for your plans"
                  : "Your teaching workspace"
              }
              color="lime"
              onClick={() => navigate(student ? "/work" : "/classes")}
            />
            <Stat
              icon={Megaphone}
              value={notices.length}
              label="Class notices"
              detail="Stay in the loop"
              color="peach"
              onClick={() =>
                document
                  .getElementById("latest-notices")
                  ?.scrollIntoView({
                    behavior: window.matchMedia(
                      "(prefers-reduced-motion: reduce)",
                    ).matches
                      ? "instant"
                      : "smooth",
                    block: "start",
                  })
              }
            />
          </div>
          <section className="panel assignments-panel">
            <SectionHeading
              title={student ? "On your radar" : "What’s coming up"}
              count={upcoming.length}
            >
              <ArrowLink
                onClick={() => navigate(student ? "/work" : "/classes")}
              >
                View all
              </ArrowLink>
            </SectionHeading>
            <p className="section-subtitle">
              {student
                ? "Your next few things, all in one place."
                : "The next deadlines across your classrooms."}
            </p>
            <div className="work-list">
              {upcoming.slice(0, 3).map((item) => (
                <WorkRow key={item.id} item={item} />
              ))}
            </div>
            {!upcoming.length && (
              <Empty
                icon={CheckCheck}
                title="Room to breathe"
                text="No unfinished assignments. Enjoy a little space for your next idea."
              />
            )}
          </section>
          <section id="latest-notices" className="notices-section">
            <SectionHeading
              title="The latest from class"
              count={notices.length}
            >
              {!student && (
                <ArrowLink onClick={() => open({ kind: "post-notice" })}>
                  Post a notice
                </ArrowLink>
              )}
            </SectionHeading>
            <div className="notice-grid">
              {notices.slice(0, 2).map((notice, index) => (
                <NoticeCard key={notice.id} notice={notice} index={index} />
              ))}
            </div>
            {!notices.length && (
              <Empty
                icon={Megaphone}
                title="A quiet moment"
                text="New class notices will find a home here."
              />
            )}
          </section>
        </div>
        <aside
          className="dashboard-rail"
          aria-label="Your workspace at a glance"
        >
          {student ? (
            <>
              <Momentum work={work} />
              <PersonalTasks />
              <ClassMini />
            </>
          ) : (
            <>
              <div className="teacher-note">
                <span className="note-star">✳</span>
                <p className="eyebrow">GOOD TEACHING, CONNECTED</p>
                <h2>
                  Make space for
                  <br />a new idea.
                </h2>
                <p>
                  A notice can spark a conversation. An assignment can open a
                  door.
                </p>
                <Button onClick={() => open({ kind: "post-notice" })}>
                  <Plus size={16} />
                  Post a notice
                </Button>
              </div>
              <ClassMini />
            </>
          )}
          <div className="local-note">
            <span className="local-note-icon">
              <Sparkles size={17} />
            </span>
            <div>
              <strong>A glimpse of what’s possible.</strong>
              <p>
                You’re exploring a local demo. Switch accounts to see both
                sides.
              </p>
              <button onClick={() => open({ kind: "accounts" })}>
                Try another perspective <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
function Stat({
  icon: Icon,
  value,
  label,
  detail,
  color,
  onClick,
}: {
  icon: typeof ListTodo;
  value: number;
  label: string;
  detail: string;
  color: string;
  onClick(): void;
}) {
  return (
    <button className="stat-card" onClick={onClick}>
      <span className={`stat-icon ${color}`}>
        <Icon size={19} />
      </span>
      <ArrowUpRight className="stat-arrow" size={16} />
      <strong className="stat-number">{String(value).padStart(2, "0")}</strong>
      <span className="stat-label">{label}</span>
      <span className="stat-detail">{detail}</span>
    </button>
  );
}
function WorkRow({ item }: { item: WorkItem }) {
  const { user, open, act } = useApp();
  const student = user.role === "student";
  return (
    <div className={`work-row ${item.completed ? "work-completed" : ""}`}>
      {student && (
        <Completion
          checked={item.completed}
          label={`${item.completed ? "Reopen" : "Complete"} ${item.title}`}
          onClick={() =>
            act(
              {
                type:
                  item.kind === "task" ? "toggle-task" : "toggle-assignment",
                id: item.id,
              },
              item.completed
                ? "Back on your list"
                : "One more thing done. Nice work!",
            )
          }
        />
      )}
      <SubjectIcon subject={item.subject} />
      <div className="work-row-main">
        {item.kind === "assignment" ? (
          <button
            className="work-title"
            onClick={() => open({ kind: "assignment", id: item.id })}
          >
            {item.title}
          </button>
        ) : (
          <span className="work-title-static">{item.title}</span>
        )}
        <span>{item.subject}</span>
      </div>
      <Due date={item.deadline} complete={item.completed} />
      {item.kind === "assignment" && (
        <IconButton
          label={`View ${item.title}`}
          onClick={() => open({ kind: "assignment", id: item.id })}
        >
          <ArrowUpRight size={18} />
        </IconButton>
      )}
    </div>
  );
}
function Momentum({ work }: { work: WorkItem[] }) {
  const complete = work.filter((item) => item.completed).length;
  const percent = work.length ? Math.round((complete / work.length) * 100) : 0;
  return (
    <section className="momentum-card">
      <div className="rail-heading">
        <h2>Your momentum</h2>
        <Sparkles size={17} />
      </div>
      <div className="momentum-content">
        <div
          className="progress-ring"
          role="img"
          aria-label={`${percent}% of all work completed`}
          style={{
            background: `conic-gradient(var(--lime) ${percent}%, #494b44 0)`,
          }}
        >
          <div>
            <strong>
              {percent}
              <span>%</span>
            </strong>
            <small>COMPLETE</small>
          </div>
        </div>
        <div>
          <h3>
            {percent === 100
              ? "Look at you go."
              : "A little progress,\nevery day."}
          </h3>
          <p>
            {complete} of {work.length} things done.
            <br />
            {percent === 100
              ? "Enjoy a well-earned pause."
              : "You’re finding your rhythm."}
          </p>
        </div>
      </div>
      <div className="momentum-footer">
        <span className="status-dot" />
        Every small step counts.
      </div>
    </section>
  );
}
function PersonalTasks() {
  const { data, user, open, act } = useApp();
  const tasks = data.tasks
    .filter((task) => task.studentId === user.id)
    .sort((a, b) => Number(a.completed) - Number(b.completed));
  return (
    <section className="panel personal-panel">
      <div className="rail-heading">
        <h2>A space for your plans</h2>
        <IconButton
          label="Add a personal task"
          onClick={() => open({ kind: "task" })}
        >
          <Plus size={18} />
        </IconButton>
      </div>
      <p className="section-subtitle">The little things on your mind.</p>
      <div className="personal-list">
        {tasks.slice(0, 3).map((task) => (
          <div
            key={task.id}
            className={`personal-row ${task.completed ? "work-completed" : ""}`}
          >
            <Completion
              checked={task.completed}
              label={`${task.completed ? "Reopen" : "Complete"} ${task.title}`}
              onClick={() =>
                act(
                  { type: "toggle-task", id: task.id },
                  task.completed
                    ? "Back on your list"
                    : "A little win for your day!",
                )
              }
            />
            <div>
              <span className="work-title-static">{task.title}</span>
              <small>{dueLabel(task.deadline)}</small>
            </div>
          </div>
        ))}
      </div>
      {!tasks.length && (
        <p className="inline-empty">
          An idea, a reminder, a tiny goal. Add your first task.
        </p>
      )}
      <button className="add-task-link" onClick={() => open({ kind: "task" })}>
        <Plus size={15} />
        Make a little plan
      </button>
    </section>
  );
}
function ClassMini() {
  const { data, user } = useApp();
  const navigate = useNavigate();
  const groups = classesFor(data, user.id);
  return (
    <section className="class-mini">
      <div className="rail-heading">
        <h2>
          {user.role === "teacher" ? "Your classrooms" : "Your classroom"}
        </h2>
        <BookOpen size={17} />
      </div>
      {groups.map((group) => (
        <button key={group.id} onClick={() => navigate(`/classes/${group.id}`)}>
          <span className={`class-mini-icon ${group.color}`}>
            <GraduationCap size={22} />
          </span>
          <span>
            <strong>{group.name}</strong>
            <small>{group.section}</small>
          </span>
          <ArrowUpRight size={16} />
        </button>
      ))}
    </section>
  );
}
function NoticeCard({ notice, index = 0 }: { notice: Notice; index?: number }) {
  const { data, open } = useApp();
  const author = data.users.find((user) => user.id === notice.authorId)!;
  const group = data.classes.find((group) => group.id === notice.classId)!;
  return (
    <button
      className={`notice-card ${index % 2 ? "notice-lilac" : "notice-cream"}`}
      onClick={() => open({ kind: "notice", id: notice.id })}
    >
      <span className="notice-card-top">
        <span>
          <Megaphone size={13} />
          CLASS NOTICE
        </span>
        <ArrowUpRight size={17} />
      </span>
      <h3>{notice.title}</h3>
      <p>{notice.message}</p>
      <span className="notice-card-bottom">
        <span className="mini-avatar">{author.initials}</span>
        <span>
          <strong>{author.name}</strong>
          <small>
            {group.code} ·{" "}
            {new Date(notice.createdAt).toLocaleDateString("en", {
              day: "numeric",
              month: "short",
            })}
          </small>
        </span>
      </span>
    </button>
  );
}
function ClassList() {
  const { data, user, open } = useApp();
  const navigate = useNavigate();
  const groups = classesFor(data, user.id);
  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <p className="eyebrow">
            <BookOpen size={14} /> A PLACE TO LEARN, TOGETHER
          </p>
          <h1>
            Your classes<span className="violet-text">.</span>
          </h1>
          <p className="page-subtitle">
            {user.role === "student"
              ? "Good questions. Fresh perspectives. Your learning starts here."
              : "Everything you share, in the right classroom."}
          </p>
        </div>
        {user.role === "teacher" && (
          <Button onClick={() => open({ kind: "post-assignment" })}>
            <Plus size={17} />
            Create assignment
          </Button>
        )}
      </div>
      <div className="class-grid">
        {groups.map((group) => (
          <button
            key={group.id}
            className="class-card"
            onClick={() => navigate(`/classes/${group.id}`)}
          >
            <span className={`class-card-art ${group.color}`}>
              <span className="class-code">{group.code}</span>
              <span className="class-art-symbol">
                {group.color === "violet" ? "✳" : "✶"}
              </span>
              <span className="class-art-circle" />
            </span>
            <span className="class-card-body">
              <span className="eyebrow">{group.section}</span>
              <strong>{group.name}</strong>
              <span className="class-subjects">
                {group.subjects.join(" · ")}
              </span>
              <span className="class-card-foot">
                <span>
                  <ClipboardList size={14} />
                  {
                    data.assignments.filter((item) => item.classId === group.id)
                      .length
                  }{" "}
                  assignments
                </span>
                <span>
                  <Megaphone size={14} />
                  {
                    data.notices.filter((item) => item.classId === group.id)
                      .length
                  }{" "}
                  notices
                </span>
                <ArrowUpRight size={20} />
              </span>
            </span>
          </button>
        ))}
      </div>
      <div className="bottom-note">
        <Sparkles size={18} />
        <span>Every classroom is a new possibility.</span>
      </div>
    </div>
  );
}
function ClassDetail() {
  const { data, user, open } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"assignments" | "notices">("assignments");
  const group = classesFor(data, user.id).find(
    (item) => item.id === location.pathname.split("/")[2],
  );
  if (!group)
    return (
      <div className="page">
        <Empty
          icon={BookOpen}
          title="This classroom isn’t in your workspace"
          text="Switch to a demo account in this section, or return to your classes."
        >
          <Button onClick={() => navigate("/classes")}>
            Back to my classes
          </Button>
        </Empty>
      </div>
    );
  const assignments = assignmentsFor(data, user.id)
    .filter((item) => item.classId === group.id)
    .sort((a, b) => a.deadline.localeCompare(b.deadline));
  const notices = noticesFor(data, user.id).filter(
    (item) => item.classId === group.id,
  );
  const items: WorkItem[] =
    user.role === "student"
      ? workFor(data, user.id).filter(
          (item) => item.kind === "assignment" && item.classId === group.id,
        )
      : assignments.map((item) => ({
          ...item,
          kind: "assignment",
          completed: false,
        }));
  return (
    <div className="page">
      <Breadcrumb current={group.code} onBack={() => navigate("/classes")} />
      <div className={`class-banner ${group.color}`}>
        <div>
          <p className="eyebrow">{group.section} / NORTHFIELD COLLEGE</p>
          <h1>
            {group.name}
            <span>.</span>
          </h1>
          <p>{group.subjects.join("  ·  ")}</p>
        </div>
        <span aria-hidden="true">✳</span>
      </div>
      <div className="class-detail-heading">
        <div className="segmented" role="group" aria-label="Class content">
          <button
            aria-pressed={tab === "assignments"}
            className={tab === "assignments" ? "selected" : ""}
            onClick={() => setTab("assignments")}
          >
            Assignments <span>{assignments.length}</span>
          </button>
          <button
            aria-pressed={tab === "notices"}
            className={tab === "notices" ? "selected" : ""}
            onClick={() => setTab("notices")}
          >
            Notices <span>{notices.length}</span>
          </button>
        </div>
        {user.role === "teacher" && (
          <Button
            onClick={() =>
              open({
                kind: tab === "assignments" ? "post-assignment" : "post-notice",
                classId: group.id,
              })
            }
          >
            <Plus size={16} />
            {tab === "assignments" ? "Create assignment" : "Post a notice"}
          </Button>
        )}
      </div>
      {tab === "assignments" ? (
        <section className="panel">
          <SectionHeading title="A little work. A lot to discover." />
          <div className="work-list">
            {items.map((item) => (
              <WorkRow key={item.id} item={item} />
            ))}
          </div>
          {!items.length && (
            <Empty
              icon={ClipboardList}
              title="A fresh page"
              text="Assignments shared with this class will appear here."
            />
          )}
        </section>
      ) : (
        <div className="notice-grid class-notices">
          {notices.map((notice, index) => (
            <NoticeCard key={notice.id} notice={notice} index={index} />
          ))}
          {!notices.length && (
            <Empty
              icon={Megaphone}
              title="Nothing to announce just yet"
              text="Class notices will appear here when they’re posted."
            />
          )}
        </div>
      )}
    </div>
  );
}
function MyWork() {
  const { data, user, open } = useApp();
  const [params, setParams] = useSearchParams();
  const filter =
    params.get("view") === "completed" ? "completed" : "unfinished";
  const setFilter = (value: "unfinished" | "completed") =>
    setParams({ view: value }, { replace: true });
  const [kind, setKind] = useState("all");
  const work = workFor(data, user.id);
  const items = work.filter(
    (item) =>
      item.completed === (filter === "completed") &&
      (kind === "all" || item.kind === kind),
  );
  const done = work.filter((item) => item.completed).length;
  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <p className="eyebrow">
            <CheckCheck size={14} /> A LITTLE MORE HEADSPACE
          </p>
          <h1>
            Your work. Your rhythm<span className="violet-text">.</span>
          </h1>
          <p className="page-subtitle">
            Class assignments and personal plans, with room to breathe.
          </p>
        </div>
        <Button onClick={() => open({ kind: "task" })}>
          <Plus size={17} />
          Add a task
        </Button>
      </div>
      <div className="work-summary">
        <div>
          <span className="work-summary-star">✳</span>
          <p>
            <strong>{done} things done.</strong> Every small step is a step
            forward.
          </p>
        </div>
        <span>
          {work.length - done} left on your list <ArrowDown size={16} />
        </span>
      </div>
      <div className="work-toolbar">
        <div className="segmented" role="group" aria-label="Completion filter">
          <button
            className={filter === "unfinished" ? "selected" : ""}
            aria-pressed={filter === "unfinished"}
            onClick={() => setFilter("unfinished")}
          >
            To do <span>{work.length - done}</span>
          </button>
          <button
            className={filter === "completed" ? "selected" : ""}
            aria-pressed={filter === "completed"}
            onClick={() => setFilter("completed")}
          >
            Completed <span>{done}</span>
          </button>
        </div>
        <label className="kind-filter">
          <span>Show</span>
          <select
            aria-label="Filter work type"
            value={kind}
            onChange={(event) => setKind(event.target.value)}
          >
            <option value="all">All work</option>
            <option value="assignment">Assignments</option>
            <option value="task">Personal tasks</option>
          </select>
        </label>
      </div>
      <section className="panel">
        <SectionHeading
          title={
            filter === "unfinished"
              ? "One thing at a time"
              : "Look how far you’ve come"
          }
          count={items.length}
        />
        <div className="work-list">
          {items.map((item) => (
            <WorkRow key={`${item.kind}-${item.id}`} item={item} />
          ))}
        </div>
        {!items.length && (
          <Empty
            icon={filter === "unfinished" ? Sparkles : CheckCheck}
            title={
              filter === "unfinished"
                ? "A little room to breathe"
                : "Your wins will live here"
            }
            text={
              filter === "unfinished"
                ? "Nothing unfinished in this view. Add a personal task or explore your classes."
                : "Complete an assignment or task to celebrate your first small win."
            }
          />
        )}
      </section>
      <p className="progress-footnote">
        <CircleHelp size={14} />
        Checking off an assignment tracks your personal progress. It doesn’t
        submit work to your teacher.
      </p>
    </div>
  );
}
function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="page">
      <Empty
        icon={BookOpen}
        title="A little off the campus path"
        text="We couldn’t find that page. Your workspace is one click away."
      >
        <Button onClick={() => navigate("/")}>Back to overview</Button>
      </Empty>
    </div>
  );
}

function Dialogs({ dialog, close }: { dialog: Dialog; close(): void }) {
  const { data, user, open } = useApp();
  const workspace = useWorkspace();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const safe = (fn: () => void) => {
    try {
      fn();
    } catch (caught) {
      setError((caught as Error).message);
    }
  };
  if (dialog.kind === "accounts")
    return (
      <Modal
        title="A different perspective."
        eyebrow="EXPLORE THE DEMO"
        onClose={close}
      >
        <p className="modal-copy">
          One campus. Two sides of the experience. Choose a fictional account to
          look around.
        </p>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="account-options">
          {data.users.map((account) => (
            <button
              key={account.id}
              className={`account-option ${account.id === user.id ? "account-selected" : ""}`}
              onClick={() =>
                safe(() => {
                  if (
                    workspace.dispatch(
                      { type: "switch", userId: account.id },
                      `You’re now in ${account.name}’s workspace`,
                    )
                  ) {
                    close();
                    navigate("/");
                  }
                })
              }
            >
              <span
                className={`avatar ${account.role === "teacher" ? "avatar-peach" : ""}`}
              >
                {account.initials}
              </span>
              <span>
                <strong>
                  {account.name}
                  <small className="role-pill">{account.role}</small>
                </strong>
                <small>{account.subtitle}</small>
              </span>
              {account.id === user.id ? (
                <Check size={19} />
              ) : (
                <ArrowUpRight size={18} />
              )}
            </button>
          ))}
        </div>
        <div className="info-note">
          <CircleHelp size={17} />
          <p>
            This is a local demo, not a login. Changes stay in this browser and
            aren’t shared with other devices.
          </p>
        </div>
      </Modal>
    );
  if (dialog.kind === "reset")
    return (
      <Modal title="A fresh start?" eyebrow="RESET DEMO" onClose={close}>
        <p className="modal-copy">
          This removes assignments, notices, tasks, and progress you added in
          this browser. The fictional sample workspace will be restored.
        </p>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <Button secondary onClick={close}>
            Keep exploring
          </Button>
          <Button
            onClick={() =>
              safe(() => {
                workspace.reset();
                close();
                navigate("/");
              })
            }
          >
            <RotateCcw size={16} />
            Reset demo
          </Button>
        </div>
      </Modal>
    );
  if (dialog.kind === "help")
    return (
      <Modal
        title="Your campus, a little closer."
        eyebrow="WELCOME TO XHINE"
        onClose={close}
      >
        <p className="modal-copy">
          A thoughtful home for what matters in college. Start small, find your
          rhythm, and explore both sides of a classroom.
        </p>
        <div className="help-steps">
          <div>
            <span>01</span>
            <p>
              <strong>Explore your day.</strong> Find class notices,
              assignments, and your own little plans.
            </p>
          </div>
          <div>
            <span>02</span>
            <p>
              <strong>Try the teacher’s view.</strong> Switch to Dr. Mira Sen
              and post an assignment to Section A.
            </p>
          </div>
          <div>
            <span>03</span>
            <p>
              <strong>Come back as Alex.</strong> Find the assignment and check
              it off. Refresh; your progress stays.
            </p>
          </div>
        </div>
        <div className="info-note">
          <CircleHelp size={17} />
          <p>
            Fictional college, local data. No real login, submissions, device
            sync, or college connection.
          </p>
        </div>
        <div className="modal-actions">
          <Button secondary onClick={() => open({ kind: "reset" })}>
            Reset demo
          </Button>
          <Button onClick={close}>
            Find my rhythm <ArrowRight size={16} />
          </Button>
        </div>
      </Modal>
    );
  if (dialog.kind === "search") return <SearchDialog close={close} />;
  if (
    dialog.kind === "task" ||
    dialog.kind === "post-assignment" ||
    dialog.kind === "post-notice"
  )
    return <CreateDialog dialog={dialog} close={close} />;
  if (dialog.kind === "assignment") {
    const item = assignmentsFor(data, user.id).find(
      (item) => item.id === dialog.id,
    );
    if (!item)
      return (
        <Modal title="Assignment unavailable" onClose={close}>
          <p>This assignment isn’t in this account’s classroom.</p>
        </Modal>
      );
    return <AssignmentDialog item={item} close={close} />;
  }
  const notice = noticesFor(data, user.id).find(
    (item) => item.id === ("id" in dialog ? dialog.id : ""),
  );
  if (!notice)
    return (
      <Modal title="Notice unavailable" onClose={close}>
        <p>This notice isn’t in this account’s classroom.</p>
      </Modal>
    );
  return (
    <Modal title={notice.title} eyebrow="FROM YOUR CLASSROOM" onClose={close}>
      <div className="detail-author">
        <span className="avatar avatar-peach">MS</span>
        <div>
          <strong>
            {data.users.find((item) => item.id === notice.authorId)?.name}
          </strong>
          <span>
            {data.classes.find((item) => item.id === notice.classId)?.section} ·{" "}
            {new Date(notice.createdAt).toLocaleDateString("en", {
              dateStyle: "medium",
            })}
          </span>
        </div>
      </div>
      <p className="detail-body">{notice.message}</p>
      <div className="modal-actions">
        <Button onClick={close}>
          Got it <Check size={16} />
        </Button>
      </div>
    </Modal>
  );
}
function AssignmentDialog({
  item,
  close,
}: {
  item: Assignment;
  close(): void;
}) {
  const { data, user } = useApp();
  const workspace = useWorkspace();
  const [error, setError] = useState("");
  const act = (action: Action, message: string) => {
    try {
      return workspace.dispatch(action, message);
    } catch (caught) {
      setError((caught as Error).message);
      return false;
    }
  };
  const complete = data.progress.some(
    (p) => p.assignmentId === item.id && p.studentId === user.id && p.completed,
  );
  const group = data.classes.find((group) => group.id === item.classId)!;
  return (
    <Modal
      title={item.title}
      eyebrow={item.subject.toUpperCase()}
      onClose={close}
    >
      <div className="detail-meta">
        <span>
          <BookOpen size={15} />
          {group.section}
        </span>
        <Due
          date={item.deadline}
          complete={user.role === "student" && complete}
        />
      </div>
      <div className="detail-author">
        <span className="avatar avatar-peach">MS</span>
        <div>
          <strong>
            {data.users.find((person) => person.id === item.authorId)?.name}
          </strong>
          <span>
            Shared{" "}
            {new Date(item.createdAt).toLocaleDateString("en", {
              dateStyle: "medium",
            })}
          </span>
        </div>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <h3 className="detail-label">A little direction</h3>
      <p className="detail-body">{item.instructions}</p>
      <div className="assignment-deadline">
        <Clock3 size={19} />
        <div>
          <strong>Your deadline</strong>
          <span>
            {parseDate(item.deadline).toLocaleDateString("en", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
      {user.role === "student" && (
        <>
          <p className="progress-footnote">
            <CircleHelp size={14} />
            This tracks your own progress. It doesn’t submit an assignment.
          </p>
          <div className="modal-actions">
            <Button secondary onClick={close}>
              Back to my day
            </Button>
            <Button
              onClick={() => {
                if (
                  act(
                    { type: "toggle-assignment", id: item.id },
                    complete
                      ? "Back on your list"
                      : "One more thing done. Nice work!",
                  )
                )
                  close();
              }}
            >
              {complete ? <RotateCcw size={16} /> : <Check size={16} />}
              {complete ? "Mark unfinished" : "Mark as complete"}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
function CreateDialog({
  dialog,
  close,
}: {
  dialog: {
    kind: "task" | "post-assignment" | "post-notice";
    classId?: string;
  };
  close(): void;
}) {
  const { data, user } = useApp();
  const workspace = useWorkspace();
  const groups = classesFor(data, user.id);
  const [classId, setClassId] = useState(
    "classId" in dialog && dialog.classId
      ? dialog.classId
      : (groups[0]?.id ?? ""),
  );
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [deadline, setDeadline] = useState("");
  const [subject, setSubject] = useState(
    data.classes.find((group) => group.id === classId)?.subjects[0] ?? "",
  );
  const [error, setError] = useState("");
  const task = dialog.kind === "task";
  const notice = dialog.kind === "post-notice";
  const group = groups.find((group) => group.id === classId);
  function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const action: Action = task
        ? { type: "task", title, deadline: deadline || null }
        : notice
          ? { type: "notice", classId, title, message: body }
          : {
              type: "assignment",
              classId,
              title,
              instructions: body,
              subject,
              deadline,
            };
      if (
        workspace.dispatch(
          action,
          task
            ? "A little plan, saved."
            : notice
              ? "Your notice is ready for class."
              : "Assignment shared with your class.",
        )
      )
        close();
    } catch (caught) {
      setError((caught as Error).message);
    }
  }
  return (
    <Modal
      title={
        task
          ? "Make a little plan."
          : notice
            ? "Keep your class in the loop."
            : "Start something worth exploring."
      }
      eyebrow={
        task
          ? "A SPACE FOR YOUR PLANS"
          : notice
            ? "NEW CLASS NOTICE"
            : "NEW ASSIGNMENT"
      }
      onClose={close}
    >
      <p className="modal-copy">
        {task
          ? "An idea, a reminder, or the next small step. This one’s just for you."
          : "Share a little direction with the right people."}
      </p>
      <form onSubmit={submit} className="create-form">
        {!task && (
          <div className="form-row">
            <label>
              Class
              <select
                value={classId}
                onChange={(event) => {
                  setClassId(event.target.value);
                  setSubject(
                    groups.find((group) => group.id === event.target.value)!
                      .subjects[0],
                  );
                }}
              >
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name} · {group.section}
                  </option>
                ))}
              </select>
            </label>
            {!notice && (
              <label>
                Subject
                <select
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                >
                  {group?.subjects.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
            )}
          </div>
        )}
        <label>
          {task ? "What’s on your mind?" : "Title"}
          <input
            name="title"
            data-autofocus
            required
            maxLength={120}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={
              task
                ? "e.g. Sketch a few ideas for my project"
                : notice
                  ? "Give your notice a clear title"
                  : "Give your assignment a little meaning"
            }
          />
        </label>
        {!task && (
          <label>
            {notice ? "Message" : "Instructions"}
            <textarea
              required
              maxLength={4000}
              rows={5}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder={
                notice
                  ? "What would you like your class to know?"
                  : "A little context, what to explore, and what to bring back…"
              }
            />
          </label>
        )}
        {!notice && (
          <DeadlineField
            value={deadline}
            onChange={setDeadline}
            optional={task}
          />
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <p className="form-note">
          {task
            ? "Only visible in this student’s workspace."
            : `Visible to the student in ${group?.section ?? "your class"}.`}{" "}
          Saved in this browser.
        </p>
        <div className="modal-actions">
          <Button secondary onClick={close}>
            Cancel
          </Button>
          <Button type="submit" disabled={workspace.busy}>
            {task ? <Plus size={16} /> : <ArrowUpRight size={16} />}
            {task ? "Add task" : notice ? "Post notice" : "Share assignment"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
function SearchDialog({ close }: { close(): void }) {
  const { data, user, open } = useApp();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const q = query.trim().toLowerCase();
  const assignments = assignmentsFor(data, user.id).filter((item) =>
    `${item.title} ${item.subject} ${item.instructions}`
      .toLowerCase()
      .includes(q),
  );
  const notices = noticesFor(data, user.id).filter((item) =>
    `${item.title} ${item.message}`.toLowerCase().includes(q),
  );
  const groups = classesFor(data, user.id).filter((item) =>
    `${item.name} ${item.section} ${item.subjects.join(" ")}`
      .toLowerCase()
      .includes(q),
  );
  const tasks =
    user.role === "student"
      ? data.tasks.filter(
          (item) =>
            item.studentId === user.id && item.title.toLowerCase().includes(q),
        )
      : [];
  const results = [
    ...assignments.map((item) => ({
      id: item.id,
      title: item.title,
      label: item.subject,
      go: () => open({ kind: "assignment", id: item.id }),
      icon: ClipboardList,
    })),
    ...notices.map((item) => ({
      id: item.id,
      title: item.title,
      label: "Class notice",
      go: () => open({ kind: "notice", id: item.id }),
      icon: Megaphone,
    })),
    ...groups.map((item) => ({
      id: item.id,
      title: item.name,
      label: item.section,
      go: () => {
        close();
        navigate(`/classes/${item.id}`);
      },
      icon: BookOpen,
    })),
    ...tasks.map((item) => ({
      id: item.id,
      title: item.title,
      label: "Personal task",
      go: () => {
        close();
        navigate(`/work?view=${item.completed ? "completed" : "unfinished"}`);
      },
      icon: ListTodo,
    })),
  ];
  return (
    <Modal
      title="Find a little clarity."
      eyebrow="SEARCH YOUR WORKSPACE"
      onClose={close}
    >
      <label className="search-field">
        <Search size={20} />
        <input
          data-autofocus
          aria-label="Search assignments, notices, classes, and tasks"
          placeholder="Assignments, notices, classes, tasks…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <p className="search-caption">
        {q
          ? `${results.length} results in your workspace`
          : "A few places to start"}
      </p>
      <div className="search-results">
        {results.slice(0, 15).map((item) => (
          <button key={item.id} onClick={item.go}>
            <item.icon size={19} />
            <span>
              <strong>{item.title}</strong>
              <small>{item.label}</small>
            </span>
            <ArrowUpRight size={16} />
          </button>
        ))}
        {!results.length && (
          <Empty
            icon={Search}
            title="No matches just yet"
            text="Try a different word or a shorter phrase."
          />
        )}
      </div>
    </Modal>
  );
}
