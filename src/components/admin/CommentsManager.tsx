import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, MessageSquare, Pin, PinOff, RefreshCw, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useComments, formatRelativeTime, type Comment } from "@/lib/comments";
import { ConfirmDialog, fieldInputClass } from "@/components/admin/ui";
import { EASE_SMOOTH, TAP_SCALE } from "@/lib/motion-tokens";

type FilterKey = "all" | "pending" | "pinned" | "regular";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "pinned", label: "Pinned" },
  { key: "regular", label: "Regular" },
];

export default function CommentsManager() {
  const { comments, pendingComments, refetch, togglePin, approveComment, deleteComment } =
    useComments();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("pending");
  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);
  const [spinning, setSpinning] = useState(false);

  // "comments" here is public/approved only (see useComments) — pending
  // comments are surfaced separately so a fresh spam submission can't slip
  // past moderation just because nobody switched tabs to look for it.
  const allComments = useMemo(
    () => [...pendingComments, ...comments],
    [pendingComments, comments],
  );

  const pinnedCount = comments.filter((c) => c.pinned).length;
  const regularCount = comments.length - pinnedCount;
  const pendingCount = pendingComments.length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base =
      filter === "pending"
        ? pendingComments
        : filter === "pinned"
          ? comments.filter((c) => c.pinned)
          : filter === "regular"
            ? comments.filter((c) => !c.pinned)
            : allComments;
    if (!q) return base;
    return base.filter(
      (c) => c.name.toLowerCase().includes(q) || c.message.toLowerCase().includes(q),
    );
  }, [allComments, comments, pendingComments, query, filter]);

  const handleRefresh = async () => {
    setSpinning(true);
    await refetch();
    toast.success("Comments refreshed.");
    setSpinning(false);
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[color:var(--ice)] sm:text-3xl">
            Comments Management
          </h1>
          <p className="mt-1 text-sm text-[color:var(--platinum)]/70">
            Moderate and manage portfolio comments.
          </p>
        </div>
        <motion.button
          type="button"
          onClick={handleRefresh}
          whileTap={TAP_SCALE}
          className="flex items-center justify-center gap-2 self-start rounded-full border border-white/10 px-4 py-2.5 text-sm font-medium text-[color:var(--platinum)] transition hover:border-[color:var(--turquoise)]/50 hover:text-[color:var(--ice)] sm:self-auto"
        >
          <RefreshCw size={15} className={spinning ? "animate-spin" : ""} />
          Refresh
        </motion.button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Pending Review", value: pendingCount },
          { label: "Published", value: comments.length },
          { label: "Pinned", value: pinnedCount },
          { label: "Regular", value: regularCount },
        ].map((s) => (
          <div key={s.label} className="card-surface p-4 text-center">
            <p className="font-display text-2xl font-semibold text-[color:var(--ice)]">{s.value}</p>
            <p className="mt-1 text-[10px] font-mono uppercase tracking-wider text-[color:var(--slate-blue)]">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--slate-blue)]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or content…"
            className={fieldInputClass + " mt-0 pl-11"}
          />
        </div>
        <div className="flex shrink-0 gap-1 rounded-full border border-white/10 bg-[color:var(--background)]/40 p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                filter === f.key
                  ? "bg-[color:var(--turquoise)] text-[color:var(--background)]"
                  : "text-[color:var(--platinum)]/70 hover:text-[color:var(--ice)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {filtered.map((c, i) => (
          <motion.div
            key={c.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04, ease: EASE_SMOOTH }}
            className="card-surface flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {!c.approved && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                    Pending
                  </span>
                )}
                {c.pinned && (
                  <span className="flex items-center gap-1 rounded-full bg-[color:var(--turquoise)]/15 px-2 py-0.5 text-[10px] font-medium text-[color:var(--turquoise)]">
                    <Pin size={10} /> Pinned
                  </span>
                )}
                <p className="text-sm font-medium text-[color:var(--ice)]">{c.name}</p>
                <span className="text-xs text-[color:var(--slate-blue)]">
                  · {formatRelativeTime(c.createdAt)}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-[color:var(--platinum)]/80">
                {c.message}
              </p>
            </div>
            <div className="flex shrink-0 gap-2 sm:flex-col">
              {!c.approved && (
                <motion.button
                  type="button"
                  onClick={async () => {
                    try {
                      await approveComment(c.id);
                      toast.success("Comment approved — now visible on the site.");
                    } catch {
                      // useSupabaseCollection already toasted the specific error.
                    }
                  }}
                  whileTap={TAP_SCALE}
                  className="flex items-center justify-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-medium text-emerald-400 transition hover:bg-emerald-400/20"
                >
                  <Check size={12} /> Approve
                </motion.button>
              )}
              <motion.button
                type="button"
                onClick={async () => {
                  const wasPinned = c.pinned;
                  try {
                    await togglePin(c.id);
                    toast.success(wasPinned ? "Comment unpinned." : "Comment pinned.");
                  } catch {
                    // useSupabaseCollection already toasted the specific error.
                  }
                }}
                whileTap={TAP_SCALE}
                className={`flex items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${
                  c.pinned
                    ? "border-[color:var(--turquoise)]/30 bg-[color:var(--turquoise)]/10 text-[color:var(--turquoise)] hover:bg-[color:var(--turquoise)]/20"
                    : "border-white/10 text-[color:var(--platinum)] hover:border-[color:var(--turquoise)]/40 hover:text-[color:var(--ice)]"
                }`}
              >
                {c.pinned ? <PinOff size={12} /> : <Pin size={12} />}
                {c.pinned ? "Unpin" : "Pin"}
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setDeleteTarget(c)}
                whileTap={TAP_SCALE}
                className="flex items-center justify-center gap-1.5 rounded-full border border-[color:var(--destructive)]/30 bg-[color:var(--destructive)]/10 px-3 py-1.5 text-[11px] font-medium text-[color:var(--destructive)] transition hover:bg-[color:var(--destructive)]/20"
              >
                <Trash2 size={12} /> Delete
              </motion.button>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center gap-3 py-16 text-center text-sm text-[color:var(--slate-blue)]">
            <MessageSquare size={28} className="text-[color:var(--slate-blue)]/60" />
            No comments found
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this comment?"
        description={`This comment from "${deleteTarget?.name}" will be permanently removed. This can't be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            try {
              await deleteComment(deleteTarget.id);
              toast.success("Comment deleted.");
            } catch {
              // useSupabaseCollection already toasted the specific error.
            }
          }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
