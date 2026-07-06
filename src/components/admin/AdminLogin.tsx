import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/lib/admin-store";
import { fieldInputClass, fieldLabelClass } from "@/components/admin/ui";
import { EASE_SMOOTH, TAP_SCALE } from "@/lib/motion-tokens";

export default function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (result.ok) {
      toast.success("Welcome back!");
      onSuccess();
    } else {
      setError(result.message || "Invalid email or password.");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[color:var(--background)] px-4">
      {/* Ambient glow blobs — same treatment as the rest of the site/admin shell */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[color:var(--turquoise)]/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[color:var(--slate-blue)]/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_SMOOTH }}
        className="card-surface relative w-full max-w-md p-8 sm:p-10"
      >
        <div className="flex flex-col items-center text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-[color:var(--turquoise)]/15 text-[color:var(--turquoise)]">
            <Lock size={24} />
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold text-[color:var(--ice)]">
            Admin Login
          </h1>
          <p className="mt-2 text-sm text-[color:var(--platinum)]/75">
            Sign in to manage your portfolio content.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="admin-email" className={fieldLabelClass}>
              Email
            </label>
            <div className="relative">
              <User
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--slate-blue)]"
              />
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldInputClass + " pl-9"}
                placeholder="Enter email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="admin-password" className={fieldLabelClass}>
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--slate-blue)]"
              />
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={fieldInputClass + " pl-9 pr-10"}
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--slate-blue)] transition hover:text-[color:var(--ice)]"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-[color:var(--destructive)]/30 bg-[color:var(--destructive)]/10 px-3 py-2 text-xs text-[color:var(--destructive)]">
              {error}
            </p>
          )}

          <motion.button
            type="submit"
            disabled={submitting}
            whileTap={submitting ? undefined : TAP_SCALE}
            className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-[color:var(--turquoise)] px-6 py-3 text-sm font-medium text-[color:var(--background)] transition-shadow hover:shadow-[0_0_40px_-5px_rgba(68,127,152,0.9)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Signing in…
              </>
            ) : (
              "Login"
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-[color:var(--slate-blue)] transition hover:text-[color:var(--turquoise)]"
          >
            ← Back to Portfolio
          </Link>
        </div>
      </motion.div>

      <p className="absolute bottom-6 text-center text-xs text-[color:var(--slate-blue)]/60">
        Private admin area — for site owner use only.
      </p>
    </div>
  );
}
