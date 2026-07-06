import { motion } from "framer-motion";
import { Award, FolderGit2, Layers, MessageSquare, Pin, UserCog } from "lucide-react";
import { useProjects } from "@/lib/projects";
import { useTechStack } from "@/lib/tech-stack";
import { useCertificates } from "@/lib/certificates";
import { useComments, formatRelativeTime } from "@/lib/comments";
import { EASE_SMOOTH, SPRING_LIFT } from "@/lib/motion-tokens";
import type { AdminSection } from "@/components/admin/types";

export default function DashboardHome({
  onNavigate,
}: {
  onNavigate: (section: AdminSection) => void;
}) {
  const { projects } = useProjects();
  const { techStack } = useTechStack();
  const { certificates } = useCertificates();
  const { comments } = useComments();

  const realProjects = projects.filter((p) => !p.placeholder);
  const pinnedComments = comments.filter((c) => c.pinned);

  const stats = [
    { label: "Total Projects", value: realProjects.length, icon: FolderGit2, tint: "#E5484D" },
    { label: "Tech Stack", value: techStack.length, icon: Layers, tint: "#447F98" },
    { label: "Certificates", value: certificates.length, icon: Award, tint: "#3ECF8E" },
    { label: "Total Comments", value: comments.length, icon: MessageSquare, tint: "#A78BFA" },
    { label: "Pinned Comments", value: pinnedComments.length, icon: Pin, tint: "#F5A623" },
  ];

  const actions: { label: string; desc: string; icon: typeof FolderGit2; section: AdminSection }[] =
    [
      {
        label: "Manage Projects",
        desc: "Add, edit, or remove portfolio projects",
        icon: FolderGit2,
        section: "projects",
      },
      {
        label: "Manage Tech Stack",
        desc: "Add, edit, and organize your tech stack",
        icon: Layers,
        section: "stack",
      },
      {
        label: "Manage Certificates",
        desc: "Upload and organize certificates",
        icon: Award,
        section: "certificates",
      },
      {
        label: "Moderate Comments",
        desc: "Review, pin, or remove visitor comments",
        icon: MessageSquare,
        section: "comments",
      },
      {
        label: "Edit Profile Settings",
        desc: "Update your bio, resume link, and social links",
        icon: UserCog,
        section: "settings",
      },
    ];

  return (
    <div>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[color:var(--ice)] sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[color:var(--platinum)]/70">
            Welcome back! Here's your portfolio overview.
          </p>
        </div>
        <p className="text-sm text-[color:var(--slate-blue)]">
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05, ease: EASE_SMOOTH }}
            className="card-surface flex items-center justify-between p-5"
          >
            <div>
              <p className="text-xs text-[color:var(--platinum)]/70">{s.label}</p>
              <p className="mt-1 font-display text-3xl font-semibold text-[color:var(--ice)]">
                {s.value}
              </p>
            </div>
            <div
              className="grid h-12 w-12 place-items-center rounded-xl"
              style={{ backgroundColor: `${s.tint}22`, color: s.tint }}
            >
              <s.icon size={20} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {actions.map((a, i) => (
          <motion.button
            key={a.label}
            type="button"
            onClick={() => onNavigate(a.section)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 + i * 0.05, ease: EASE_SMOOTH }}
            whileHover={{ y: -3, transition: SPRING_LIFT }}
            className="card-surface flex flex-col p-6 text-left transition hover:border-[color:var(--turquoise)]/40"
          >
            <a.icon size={20} className="text-[color:var(--turquoise)]" />
            <p className="mt-4 font-display text-lg font-semibold text-[color:var(--ice)]">
              {a.label}
            </p>
            <p className="mt-1 text-sm text-[color:var(--platinum)]/70">{a.desc}</p>
          </motion.button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.35, ease: EASE_SMOOTH }}
        className="card-surface mt-6 p-6"
      >
        <h3 className="font-display text-lg font-semibold text-[color:var(--ice)]">
          Recent Comments Activity
        </h3>
        <p className="mt-1 text-sm text-[color:var(--platinum)]/70">
          The latest visitor comments left on your portfolio.
        </p>

        {comments.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-3 py-8 text-center text-sm text-[color:var(--slate-blue)]">
            <MessageSquare size={24} className="text-[color:var(--slate-blue)]/60" />
            No comments yet
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {comments.slice(0, 5).map((c) => (
              <div
                key={c.id}
                className="flex items-start gap-3 border-b border-white/5 pb-4 last:border-0 last:pb-0"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--turquoise)]/15 text-[color:var(--turquoise)]">
                  <MessageSquare size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-[color:var(--ice)]">{c.name}</p>
                    <span className="shrink-0 text-xs text-[color:var(--slate-blue)]">
                      {formatRelativeTime(c.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs text-[color:var(--platinum)]/70">
                    {c.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
