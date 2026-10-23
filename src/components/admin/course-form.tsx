import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Course = Tables<"courses">;

const TEXT_FIELDS: { name: keyof Course; label: string; area?: boolean; required?: boolean }[] = [
  { name: "title", label: "Course title", required: true },
  { name: "short_description", label: "Short description (shown on card)", area: true, required: true },
  { name: "description", label: "Full description", area: true, required: true },
  { name: "suitable_for", label: "Who it's for", area: true },
  { name: "outcomes", label: "Outcomes", area: true },
  { name: "entry_requirements", label: "Entry requirements", area: true },
  { name: "enrolment_instructions", label: "Enrolment instructions", area: true },
  { name: "certification_requirements", label: "Certification requirements", area: true },
  { name: "delivery_notes", label: "How classes are delivered (e.g. Google Meet / Zoom)", area: true },
  { name: "disclaimer", label: "Disclaimer (optional)", area: true },
];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
}

export function CourseForm({ course }: { course?: Course }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    const lines = (k: string) => get(k).split("\n").map((l) => l.trim()).filter(Boolean);
    const priceRaw = get("price");
    const price = priceRaw === "" ? null : Number(priceRaw);
    if (price !== null && (Number.isNaN(price) || price < 0)) {
      toast.error("Price must be a positive number, or leave it empty.");
      return;
    }
    const record = {
      title: get("title"),
      slug: course?.slug || slugify(get("title")),
      short_description: get("short_description"),
      description: get("description"),
      suitable_for: get("suitable_for"),
      outcomes: get("outcomes"),
      entry_requirements: get("entry_requirements"),
      enrolment_instructions: get("enrolment_instructions"),
      certification_requirements: get("certification_requirements"),
      delivery_notes: get("delivery_notes"),
      disclaimer: get("disclaimer"),
      objectives: lines("objectives"),
      curriculum: lines("curriculum"),
      duration: get("duration") || null,
      price,
      currency: get("currency") || "NGN",
      sort_order: Number(get("sort_order") || 0),
      status: get("status") as Course["status"],
      icon: course?.icon || "graduation-cap",
    };
    setBusy(true);
    const { error } = course
      ? await supabase.from("courses").update(record).eq("id", course.id)
      : await supabase.from("courses").insert(record);
    setBusy(false);
    if (error) {
      toast.error(`Not saved: ${error.message}`);
      return;
    }
    toast.success("Course saved");
    qc.invalidateQueries({ queryKey: ["courses"] });
    qc.invalidateQueries({ queryKey: ["admin", "courses"] });
    navigate({ to: "/admin" });
  }

  async function onDelete() {
    if (!course || !confirm(`Delete "${course.title}" permanently? Consider "Archived" instead.`)) return;
    const { error } = await supabase.from("courses").delete().eq("id", course.id);
    if (error) return toast.error(`Not deleted: ${error.message}`);
    toast.success("Course deleted");
    qc.invalidateQueries({ queryKey: ["admin", "courses"] });
    navigate({ to: "/admin" });
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-5">
      {TEXT_FIELDS.map((fd) => (
        <div key={fd.name} className="space-y-1.5">
          <Label htmlFor={fd.name}>{fd.label}</Label>
          {fd.area ? (
            <Textarea id={fd.name} name={fd.name} rows={3} required={fd.required}
              defaultValue={(course?.[fd.name] as string) ?? ""} />
          ) : (
            <Input id={fd.name} name={fd.name} required={fd.required}
              defaultValue={(course?.[fd.name] as string) ?? ""} />
          )}
        </div>
      ))}
      <div className="space-y-1.5">
        <Label htmlFor="objectives">Objectives (one per line)</Label>
        <Textarea id="objectives" name="objectives" rows={4} defaultValue={course?.objectives.join("\n")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="curriculum">Curriculum / modules (one per line)</Label>
        <Textarea id="curriculum" name="curriculum" rows={6} defaultValue={course?.curriculum.join("\n")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="price">Price (leave empty if not set)</Label>
          <Input id="price" name="price" type="number" min="0" step="0.01" defaultValue={course?.price ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" name="currency" defaultValue={course?.currency ?? "NGN"} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="duration">Duration (e.g. 8 weeks)</Label>
          <Input id="duration" name="duration" defaultValue={course?.duration ?? ""} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="status">Visibility</Label>
          <select id="status" name="status" defaultValue={course?.status ?? "draft"}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground">
            <option value="draft">Draft (hidden)</option>
            <option value="published">Published (visible to public)</option>
            <option value="archived">Archived (hidden)</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sort_order">Display order (1 = first)</Label>
          <Input id="sort_order" name="sort_order" type="number" defaultValue={course?.sort_order ?? 0} />
        </div>
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save course"}</Button>
        {course && <Button type="button" variant="destructive" onClick={onDelete}>Delete</Button>}
      </div>
    </form>
  );
}
