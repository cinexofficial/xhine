import { useEffect, useId, useRef, type ReactNode } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  X,
  type LucideIcon,
} from "lucide-react";
import { dateKey, parseDate } from "./domain";
export function IconButton({
  label,
  children,
  onClick,
  className = "",
}: {
  label: string;
  children: ReactNode;
  onClick(): void;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`icon-button ${className}`}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
export function Button({
  children,
  onClick,
  secondary,
  disabled,
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  disabled?: boolean;
  type?: "submit" | "button";
  className?: string;
}) {
  return (
    <button
      type={type}
      className={`button ${secondary ? "button-secondary" : ""} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
export function Modal({
  title,
  eyebrow,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  onClose(): void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const opener = document.activeElement;
    dialog?.showModal();
    dialog?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    return () => {
      dialog?.close();
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, [title]);
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? "modal-wide" : ""}`}
      aria-labelledby={headingId}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = [
          ...event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]',
          ),
        ].filter((element) => element.getClientRects().length > 0);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            onClose();
        }
      }}
    >
      <div className="modal-header">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 id={headingId}>{title}</h2>
        </div>
        <IconButton label="Close dialog" onClick={onClose}>
          <X size={20} />
        </IconButton>
      </div>
      {children}
    </dialog>
  );
}
export function Empty({
  icon: Icon,
  title,
  text,
  children,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Icon size={26} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      {children}
    </div>
  );
}
export function SectionHeading({
  title,
  children,
  count,
}: {
  title: string;
  children?: ReactNode;
  count?: number;
}) {
  return (
    <div className="section-heading">
      <h2>
        {title}
        {count !== undefined && <span className="count">{count}</span>}
      </h2>
      {children}
    </div>
  );
}
export function ArrowLink({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick(): void;
}) {
  return (
    <button className="text-link" onClick={onClick}>
      {children}
      <ArrowUpRight size={16} />
    </button>
  );
}
export function Completion({
  checked,
  label,
  onClick,
}: {
  checked: boolean;
  label: string;
  onClick(): void;
}) {
  return (
    <button
      type="button"
      className={`completion ${checked ? "is-complete" : ""}`}
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onClick}
    >
      {checked && <Check size={14} strokeWidth={3} />}
    </button>
  );
}
export function SubjectIcon({
  subject,
  small = false,
}: {
  subject: string;
  small?: boolean;
}) {
  const kind = subject.includes("Design")
    ? "design"
    : subject.includes("Data")
      ? "data"
      : subject.includes("Network")
        ? "network"
        : "personal";
  return (
    <span
      aria-hidden="true"
      className={`subject-icon subject-${kind} ${small ? "small" : ""}`}
    >
      {kind === "design"
        ? "✳"
        : kind === "data"
          ? "{ }"
          : kind === "network"
            ? "⌘"
            : "↗"}
    </span>
  );
}
export function dueLabel(value: string | null) {
  if (!value) return "No deadline";
  const today = dateKey();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (value === today) return "Due today";
  if (value === dateKey(tomorrow)) return "Due tomorrow";
  if (value < today)
    return `Overdue · ${parseDate(value).toLocaleDateString("en", { day: "numeric", month: "short" })}`;
  return `Due ${parseDate(value).toLocaleDateString("en", { day: "numeric", month: "short" })}`;
}
export function Due({
  date,
  complete = false,
}: {
  date: string | null;
  complete?: boolean;
}) {
  return (
    <span
      className={`due ${complete ? "due-complete" : date && date <= dateKey() ? "due-urgent" : ""}`}
    >
      {complete ? (
        <>
          <Check size={12} />
          Complete
        </>
      ) : (
        dueLabel(date)
      )}
    </span>
  );
}
export function Art({ teacher = false }: { teacher?: boolean }) {
  return (
    <div className="hero-art" aria-hidden="true">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <span className="art-spark spark-one">✳</span>
      <span className="art-spark spark-two">✦</span>
      <div className="art-card back-card">
        <div className="paper-dot" />
        <div className="paper-line" />
        <div className="paper-line short" />
      </div>
      <div className="art-card front-card">
        <span className="paper-eyebrow">
          {teacher ? "THE NEXT BIG IDEA" : "A LITTLE EVERY DAY"}
        </span>
        <div className="art-check">
          <Check size={38} strokeWidth={2.5} />
        </div>
        <div className="paper-line" />
        <div className="paper-line short" />
        <span className="paper-stamp">MAKE IT HAPPEN ↗</span>
      </div>
      <span className="art-star">✶</span>
    </div>
  );
}
export function Breadcrumb({
  current,
  onBack,
}: {
  current: string;
  onBack(): void;
}) {
  return (
    <div className="breadcrumb">
      <button onClick={onBack}>My classes</button>
      <ChevronRight size={14} />
      <span>{current}</span>
    </div>
  );
}
export function DeadlineField({
  value,
  onChange,
  optional,
}: {
  value: string;
  onChange(value: string): void;
  optional: boolean;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id}>
        Deadline {optional && <span className="optional">(optional)</span>}
      </label>
      <input
        id={id}
        type="date"
        required={!optional}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <div className="date-shortcuts" aria-label="Quick deadline choices">
        {[
          { days: 0, label: "Today" },
          { days: 1, label: "Tomorrow" },
          { days: 7, label: "In a week" },
        ].map((option) => (
          <button
            key={option.days}
            type="button"
            onClick={() => {
              const date = new Date();
              date.setDate(date.getDate() + option.days);
              onChange(dateKey(date));
            }}
          >
            {option.label}
          </button>
        ))}
        {optional && value && (
          <button type="button" onClick={() => onChange("")}>
            Clear date
          </button>
        )}
      </div>
    </div>
  );
}
