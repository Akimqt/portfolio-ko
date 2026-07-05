import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  FolderGit2,
  GraduationCap,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  UserCog,
  X,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { useAdminAuth } from "@/lib/admin-store";
import { EASE_SMOOTH } from "@/lib/motion-tokens";
import AdminLogin from "@/components/admin/AdminLogin";
import DashboardHome from "@/components/admin/DashboardHome";
import ProjectsManager from "@/components/admin/ProjectsManager";
import TechStackManager from "@/components/admin/TechStackManager";
import CertificatesManager from "@/components/admin/CertificatesManager";
import ExperienceManager from "@/components/admin/ExperienceManager";
import CommentsManager from "@/components/admin/CommentsManager";
import SettingsManager from "@/components/admin/SettingsManager";
import type { AdminSection } from "@/components/admin/types";

const NAV_ITEMS: { section: AdminSection; label: string; icon: typeof LayoutDashboard }[] = [
  { section: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { section: "projects", label: "Projects", icon: FolderGit2 },
  { section: "stack", label: "Tech Stack", icon: Layers },
  { section: "certificates", label: "Certificates", icon: Award },
  { section: "experience", label: "Experience", icon: GraduationCap },
  { section: "comments", label: "Comments", icon: MessageSquare },
  { section: "settings", label: "Profile Settings", icon: UserCog },
];

function SidebarContent({
  active,
  onNavigate,
}: {
  active: AdminSection;
  onNavigate: (section: AdminSection) => void;
}) {
  return (
    <nav className="space-y-1.5 p-4">
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.section;
        return (
          <button
            key={item.section}
            type="button"
            onClick={() => onNavigate(item.section)}
            className={`relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              isActive
                ? "text-[color:var(--background)]"
                : "text-[color:var(--platinum)]/80 hover:bg-white/5 hover:text-[color:var(--ice)]"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="admin-nav-pill"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                className="absolute inset-0 rounded-xl bg-[color:var(--turquoise)] shadow-[0_0_24px_-6px_rgba(68,127,152,0.8)]"
              />
            )}
            <span className="relative z-10 flex items-center gap-3">
              <item.icon size={17} />
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function Topbar({ onMenuClick, onLogout }: { onMenuClick: () => void; onLogout: () => void }) {
  const { email } = useAdminAuth();
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[color:var(--background)]/80 px-4 py-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="grid h-9 w-9 place-items-center rounded-lg text-[color:var(--platinum)] transition hover:bg-white/5 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={19} />
        </button>
        <Link
          to="/"
          className="hidden items-center gap-2 text-[color:var(--slate-blue)] transition hover:text-[color:var(--ice)] lg:flex"
          aria-label="Close admin panel"
        >
          <X size={18} />
        </Link>
        <h2 className="font-display text-lg font-semibold text-[color:var(--ice)]">Admin Panel</h2>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden text-sm text-[color:var(--platinum)]/70 sm:inline">
          Welcome, <span className="font-medium text-[color:var(--ice)]">{email ?? "admin"}</span>
        </span>
        <motion.button
          type="button"
          onClick={onLogout}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-1.5 rounded-full border border-[color:var(--destructive)]/30 bg-[color:var(--destructive)]/10 px-4 py-2 text-xs font-medium text-[color:var(--destructive)] transition hover:bg-[color:var(--destructive)]/20"
        >
          <LogOut size={13} /> Logout
        </motion.button>
      </div>
    </header>
  );
}

function AdminPanel() {
  const { logout } = useAdminAuth();
  const [section, setSection] = useState<AdminSection>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = (next: AdminSection) => {
    setSection(next);
    setMobileOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-[color:var(--background)]">
      {/* Ambient glow blobs, matching the rest of the site */}
      <div className="pointer-events-none fixed -left-40 top-0 h-96 w-96 rounded-full bg-[color:var(--turquoise)]/10 blur-[130px]" />
      <div className="pointer-events-none fixed -right-40 bottom-0 h-96 w-96 rounded-full bg-[color:var(--slate-blue)]/10 blur-[130px]" />

      <Topbar onMenuClick={() => setMobileOpen(true)} onLogout={logout} />

      <div className="relative mx-auto flex max-w-[1400px]">
        {/* Desktop sidebar */}
        <aside className="sticky top-[65px] hidden h-[calc(100vh-65px)] w-64 shrink-0 border-r border-white/10 lg:block">
          <SidebarContent active={section} onNavigate={navigate} />
        </aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ duration: 0.3, ease: EASE_SMOOTH }}
                className="fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 bg-[color:var(--background)] lg:hidden"
              >
                <div className="flex items-center justify-between border-b border-white/10 p-4">
                  <span className="font-display text-lg font-semibold text-[color:var(--ice)]">
                    Admin Panel
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close menu"
                    className="grid h-8 w-8 place-items-center rounded-full text-[color:var(--platinum)] hover:bg-white/5"
                  >
                    <X size={16} />
                  </button>
                </div>
                <SidebarContent active={section} onNavigate={navigate} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: EASE_SMOOTH }}
            >
              {section === "dashboard" && <DashboardHome onNavigate={navigate} />}
              {section === "projects" && <ProjectsManager />}
              {section === "stack" && <TechStackManager />}
              {section === "certificates" && <CertificatesManager />}
              {section === "experience" && <ExperienceManager />}
              {section === "comments" && <CommentsManager />}
              {section === "settings" && <SettingsManager />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { authed, ready } = useAdminAuth();

  return (
    <>
      <Toaster theme="dark" position="top-right" />
      {!ready ? null : authed ? <AdminPanel /> : <AdminLogin onSuccess={() => undefined} />}
    </>
  );
}
