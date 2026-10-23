import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { CourseForm } from "@/components/admin/course-form";

export const Route = createFileRoute("/_authenticated/admin/courses/$id")({ component: EditCourse });

function EditCourse() {
  const { id } = Route.useParams();
  const q = useQuery({
    queryKey: ["admin", "course", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  if (q.isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (q.error) return <p className="text-destructive">Could not load: {q.error.message}</p>;
  if (!q.data) return <p className="text-muted-foreground">Course not found.</p>;
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-foreground">Edit: {q.data.title}</h1>
      <CourseForm course={q.data} />
    </div>
  );
}
