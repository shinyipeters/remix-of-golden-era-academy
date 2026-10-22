import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock } from "lucide-react";

import { courseIcon } from "@/lib/course-icon";
import type { Tables } from "@/integrations/supabase/types";

export function formatPrice(course: Pick<Tables<"courses">, "price" | "currency">) {
  if (course.price == null) return "Contact us for pricing";
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: course.currency || "NGN",
      maximumFractionDigits: 0,
    }).format(course.price);
  } catch {
    return `${course.currency} ${course.price}`;
  }
}

export function CourseCard({ course }: { course: Tables<"courses"> }) {
  const Icon = courseIcon(course.slug, course.title);

  return (
    <Link
      to="/courses/$slug"
      params={{ slug: course.slug }}
      className="group flex flex-col rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/60"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-foreground group-hover:text-primary">
        {course.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
        {course.short_description}
      </p>
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-4 w-4" />
          {course.duration ?? "Flexible"}
        </span>
        <span className="font-semibold text-primary">{formatPrice(course)}</span>
      </div>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
        View course
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
