import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useExperience, type ExperienceItem } from "@/lib/experience";
import {
  EXPERIENCE_ICONS,
  getExperienceIcon,
  type ExperienceIconKey,
} from "@/lib/experience-icons";
import {
  ConfirmDialog,
  Field,
  fieldInputClass,
  GhostButton,
  Modal,
  PrimaryButton,
} from "@/components/admin/ui";
import { EASE_SMOOTH } from "@/lib/motion-tokens";

type ExperienceForm = {
  iconKey: ExperienceIconKey;
  tag: string;
  title: string;
  sub: string;
  body: string;
  order: number;
  placeholder: boolean;
};

function emptyForm(nextOrder: number): ExperienceForm {
  return {
    iconKey: "briefcase",
    tag: "",
    title: "",
    sub: "",
    body: "",
    order: nextOrder,
    placeholder: false,
  };
}

export default function ExperienceManager() {
  const { experience, addExperience, updateExperience, deleteExperience } = useExperience();

  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ExperienceForm>(emptyForm(1));
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExperienceItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const sorted = useMemo(() => [...experience].sort((a, b) => a.order - b.order), [experience]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.sub.toLowerCase().includes(q) ||
        e.tag.toLowerCase().includes(q),
    );
  }, [sorted, query]);

  const openAddModal = () => {
    const nextOrder = sorted.length > 0 ? Math.max(...sorted.map((e) => e.order)) + 1 : 1;
    setEditingId(null);
    setForm(emptyForm(nextOrder));
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (e: ExperienceItem) => {
    setEditingId(e.id);
    setForm({
      iconKey: e.iconKey,
      tag: e.tag,
      title: e.title,
      sub: e.sub,
      body: e.body,
      order: e.order,
      placeholder: e.placeholder,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.sub.trim() || !form.body.trim() || !form.tag.trim()) {
      setFormError("Tag, title, subtitle, and description are all required.");
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await updateExperience(editingId, form);
        toast.success("Experience entry updated.");
      } else {
        await addExperience(form);
        toast.success("Experience entry added.");
      }
      setModalOpen(false);
    } catch {
      // useSupabaseCollection already toasted the specific error.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[color:var(--ice)] sm:text-3xl">
            Experience & Education
          </h1>
          <p className="mt-1 text-sm text-[color:var(--platinum)]/70">
            Manage the timeline shown on your portfolio's Experience section.
          </p>
        </div>
        <PrimaryButton onClick={openAddModal}>
          <Plus size={16} /> Add Entry
        </PrimaryButton>
      </div>

      <div className="relative mt-6">
        <Search
          size={16}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--slate-blue)]"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, subtitle, or tag…"
          className={fieldInputClass + " mt-0 pl-11"}
        />
      </div>

      <div className="mt-6 space-y-3">
        {filtered.map((e, i) => {
          const Icon = getExperienceIcon(e.iconKey).icon;
          return (
            <motion.div
              key={e.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.03, ease: EASE_SMOOTH }}
              className={`card-surface flex items-start gap-4 p-4 sm:items-center ${
                e.placeholder ? "border-dashed border-[color:var(--slate-blue)]/30" : ""
              }`}
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[color:var(--turquoise)]/10 text-[color:var(--turquoise)]">
                <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[color:var(--turquoise)]">
                  {e.tag}
                </span>
                <h3 className="truncate text-sm font-semibold text-[color:var(--ice)]">
                  {e.title}
                </h3>
                <p className="truncate text-xs text-[color:var(--slate-blue)]">{e.sub}</p>
              </div>
              <span className="hidden shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-mono text-[color:var(--slate-blue)] sm:block">
                #{e.order}
              </span>
              <div className="flex shrink-0 gap-2">
                <motion.button
                  type="button"
                  onClick={() => openEditModal(e)}
                  whileTap={{ scale: 0.96 }}
                  aria-label="Edit entry"
                  className="grid h-9 w-9 place-items-center rounded-full border border-[color:var(--turquoise)]/30 bg-[color:var(--turquoise)]/10 text-[color:var(--turquoise)] transition hover:bg-[color:var(--turquoise)]/20"
                >
                  <Pencil size={13} />
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setDeleteTarget(e)}
                  whileTap={{ scale: 0.96 }}
                  aria-label="Delete entry"
                  className="grid h-9 w-9 place-items-center rounded-full border border-[color:var(--destructive)]/30 bg-[color:var(--destructive)]/10 text-[color:var(--destructive)] transition hover:bg-[color:var(--destructive)]/20"
                >
                  <Trash2 size={13} />
                </motion.button>
              </div>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-16 text-center text-sm text-[color:var(--slate-blue)]">
            No experience entries match your search.
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Experience Entry" : "Add Experience Entry"}
        footer={
          <>
            <GhostButton onClick={() => setModalOpen(false)}>Cancel</GhostButton>
            <PrimaryButton onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving…" : editingId ? "Update" : "Create"}
            </PrimaryButton>
          </>
        }
      >
        {formError && (
          <p className="rounded-lg border border-[color:var(--destructive)]/30 bg-[color:var(--destructive)]/10 px-3 py-2 text-xs text-[color:var(--destructive)]">
            {formError}
          </p>
        )}

        <Field label="Icon">
          <div className="mt-1.5 grid grid-cols-5 gap-2">
            {EXPERIENCE_ICONS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                title={label}
                onClick={() => setForm((f) => ({ ...f, iconKey: key }))}
                className={`grid h-11 place-items-center rounded-xl border transition ${
                  form.iconKey === key
                    ? "border-[color:var(--turquoise)] bg-[color:var(--turquoise)]/15 text-[color:var(--turquoise)]"
                    : "border-white/10 text-[color:var(--slate-blue)] hover:border-white/20 hover:text-[color:var(--ice)]"
                }`}
              >
                <Icon size={17} />
              </button>
            ))}
          </div>
        </Field>

        <Field label="Tag" required hint="Short date range or label — e.g. “2024 – 2028”.">
          <input
            type="text"
            value={form.tag}
            onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
            className={fieldInputClass}
            placeholder="e.g. 2024 – 2028"
          />
        </Field>

        <Field label="Title" required>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className={fieldInputClass}
            placeholder="e.g. BS Computer Engineering"
          />
        </Field>

        <Field label="Subtitle" required hint="Institution, org, or role context.">
          <input
            type="text"
            value={form.sub}
            onChange={(e) => setForm((f) => ({ ...f, sub: e.target.value }))}
            className={fieldInputClass}
            placeholder="e.g. Pamantasan ng Lungsod ng San Pablo"
          />
        </Field>

        <Field label="Description" required>
          <textarea
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            rows={4}
            className={fieldInputClass + " resize-none"}
          />
        </Field>

        <Field
          label="Order"
          hint="Lower numbers appear first on the timeline. Entries are sorted by this value."
        >
          <input
            type="number"
            value={form.order}
            onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) || 0 }))}
            className={fieldInputClass}
          />
        </Field>

        <label className="flex items-center gap-2.5 text-sm text-[color:var(--platinum)]/80">
          <input
            type="checkbox"
            checked={form.placeholder}
            onChange={(e) => setForm((f) => ({ ...f, placeholder: e.target.checked }))}
            className="h-4 w-4 rounded border-white/20 bg-transparent accent-[color:var(--turquoise)]"
          />
          Show as an "upcoming" placeholder (dashed card, pulsing node)
        </label>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this entry?"
        description={`“${deleteTarget?.title}” will be removed from your timeline. This can't be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            try {
              await deleteExperience(deleteTarget.id);
              toast.success("Experience entry deleted.");
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
