import { useSupabaseCollection } from "@/lib/admin-store";

export type Comment = {
  id: string;
  name: string;
  email?: string; // optional, never rendered publicly
  message: string;
  pinned: boolean;
  createdAt: string; // ISO timestamp
};

const TABLE = "comments";

function sortComments(items: Comment[]): Comment[] {
  return [...items].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function useComments() {
  const {
    items,
    loading,
    refetch,
    insert,
    update,
    remove: deleteComment,
  } = useSupabaseCollection<Comment>(TABLE, "id");

  // Visitor-facing: allowed by RLS for anyone, no admin session required.
  const addComment = (data: { name: string; email?: string; message: string }) =>
    insert({
      name: data.name,
      email: data.email || undefined,
      message: data.message,
      pinned: false,
    });

  // Admin-only: RLS rejects these unless the request carries an authenticated
  // Supabase session.
  const togglePin = (id: string) => {
    const current = items.find((c) => c.id === id);
    if (!current) return;
    return update(id, { pinned: !current.pinned } as Partial<Comment>);
  };

  return { comments: sortComments(items), loading, refetch, addComment, togglePin, deleteComment };
}

/**
 * Small shared "2h ago" / "3d ago" formatter for comment timestamps. Lives
 * here (rather than duplicated in Portfolio.tsx / CommentsManager.tsx /
 * DashboardHome.tsx) since every comment-related surface needs the same
 * formatting.
 */
export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffSec = Math.round(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  const diffWeek = Math.round(diffDay / 7);
  if (diffWeek < 5) return `${diffWeek}w ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
