import type { ComponentType } from "react";
import {
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Code2,
  GraduationCap,
  Rocket,
  Star,
  Target,
  Users,
} from "lucide-react";

export type ExperienceIconKey =
  | "graduation-cap"
  | "users"
  | "briefcase"
  | "award"
  | "book-open"
  | "building"
  | "code"
  | "rocket"
  | "star"
  | "target";

type IconEntry = { key: ExperienceIconKey; label: string; icon: ComponentType<{ size?: number }> };

export const EXPERIENCE_ICONS: IconEntry[] = [
  { key: "graduation-cap", label: "Education", icon: GraduationCap },
  { key: "users", label: "Team / Leadership", icon: Users },
  { key: "briefcase", label: "Work / Internship", icon: Briefcase },
  { key: "award", label: "Award / Recognition", icon: Award },
  { key: "book-open", label: "Course / Training", icon: BookOpen },
  { key: "building", label: "Organization", icon: Building2 },
  { key: "code", label: "Project / Dev Work", icon: Code2 },
  { key: "rocket", label: "Milestone / Launch", icon: Rocket },
  { key: "star", label: "Highlight", icon: Star },
  { key: "target", label: "Goal / Upcoming", icon: Target },
];

const ICON_MAP = new Map(EXPERIENCE_ICONS.map((e) => [e.key, e]));

export function getExperienceIcon(key: string): IconEntry {
  return ICON_MAP.get(key as ExperienceIconKey) ?? EXPERIENCE_ICONS[0];
}
