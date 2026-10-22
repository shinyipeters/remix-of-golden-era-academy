import {
  Bitcoin,
  Bot,
  Code2,
  GraduationCap,
  Laptop,
  LineChart,
  Megaphone,
  Palette,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

/** Pick a representative icon for a course from its slug/title keywords. */
export function courseIcon(slug: string, title: string): LucideIcon {
  const key = `${slug} ${title}`.toLowerCase();
  if (key.includes("crypto")) return Bitcoin;
  if (key.includes("forex")) return TrendingUp;
  if (key.includes("web")) return Code2;
  if (key.includes("graphic")) return Palette;
  if (key.includes("artificial intelligence") || key.includes("ai")) return Bot;
  if (key.includes("financial") || key.includes("investment")) return LineChart;
  if (key.includes("social media")) return Megaphone;
  if (key.includes("digital")) return Laptop;
  return GraduationCap;
}
