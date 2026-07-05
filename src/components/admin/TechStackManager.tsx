import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTechStack, type TechStackItem } from "@/lib/tech-stack";
import { getTechIcon } from "@/lib/tech-icons";
import {
  ConfirmDialog,
  Field,
  fieldInputClass,
  GhostButton,
  IconPicker,
  Modal,
  PrimaryButton,
} from "@/components/admin/ui";
import { EASE_SMOOTH } from "@/lib/motion-tokens";

type TechForm = { name: string; category: string; iconKey: string; color: string };

const EMPTY_FORM: TechForm = { name: "", category: "", iconKey: "generic-code", color: "#447F98" };

export default function TechStackManager() {
  const { techStack, addTechItem, updateTechItem, deleteTechItem } = useTechStack();

  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TechForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TechStackItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const categories = useMemo(
    () => Array.from(new Set(techStack.map((t) => t.category))),
    [techStack],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return techStack;
    return techStack.filter(
      (t) => t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q),
    );
  }, [techStack, query]);

  const openAddModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (t: TechStackItem) => {
    setEditingId(t.id);
    setForm({ name: t.name, category: t.category, iconKey: t.iconKey, color: t.color });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.category.trim()) {
      setFormError("Name and category are required.");
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await updateTechItem(editingId, form);
        toast.success("Tech stack item updated.");
      } else {
        await addTechItem(form);
        toast.success("Tech stack item added.");
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
            Tech Stack Management
          </h1>
          <p className="mt-1 text-sm text-[color:var(--platinum)]/70">
            Add, edit, and organize the technologies shown on your portfolio.
          </p>
        </div>
        <PrimaryButton onClick={openAddModal}>
          <Plus size={16} /> Add Tech Stack
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
          placeholder="Search tech stack…"
          className={fieldInputClass + " mt-0 pl-11"}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t, i) => {
          const Icon = getTechIcon(t.iconKey).icon;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03, ease: EASE_SMOOTH }}
              className="card-surface p-5"
            >
              <div className="flex items-center gap-3">
                <div
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl"
                  style={{ backgroundColor: `${t.color}26`, color: t.color }}
                >
                  <Icon />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-[color:var(--ice)]">{t.name}</p>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[color:var(--slate-blue)]">
                    {t.category}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <motion.button
                  type="button"
                  onClick={() => openEditModal(t)}
                  whileTap={{ scale: 0.96 }}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[color:var(--turquoise)]/30 bg-[color:var(--turquoise)]/10 px-3 py-2 text-xs font-medium text-[color:var(--turquoise)] transition hover:bg-[color:var(--turquoise)]/20"
                >
                  <Pencil size={13} /> Edit
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setDeleteTarget(t)}
                  whileTap={{ scale: 0.96 }}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[color:var(--destructive)]/30 bg-[color:var(--destructive)]/10 px-3 py-2 text-xs font-medium text-[color:var(--destructive)] transition hover:bg-[color:var(--destructive)]/20"
                >
                  <Trash2 size={13} /> Delete
                </motion.button>
              </div>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-sm text-[color:var(--slate-blue)]">
            No tech stack items match your search.
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Tech Stack Item" : "Add Tech Stack Item"}
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

        <Field label="Name" required>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={fieldInputClass}
            placeholder="e.g. React"
          />
        </Field>

        <Field label="Category" required hint={`Existing: ${categories.join(", ") || "—"}`}>
          <input
            type="text"
            list="tech-categories"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className={fieldInputClass}
            placeholder="e.g. Frontend, Backend, Hardware, Tools"
          />
          <datalist id="tech-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>

        <Field label="Icon">
          <IconPicker
            value={form.iconKey}
            onChange={(iconKey, defaultColor) =>
              setForm((f) => ({ ...f, iconKey, color: defaultColor }))
            }
          />
        </Field>

        <Field
          label="Color"
          hint="Auto-filled from the icon's brand color — tweak it if you'd like."
        >
          <div className="mt-1.5 flex items-center gap-3">
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
              className="h-11 w-14 cursor-pointer rounded-lg border border-white/10 bg-transparent"
            />
            <input
              type="text"
              value={form.color}
              onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
              className={fieldInputClass + " mt-0"}
            />
          </div>
        </Field>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this tech stack item?"
        description={`“${deleteTarget?.name}” will be removed from your portfolio. This can't be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            try {
              await deleteTechItem(deleteTarget.id);
              toast.success("Tech stack item deleted.");
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
