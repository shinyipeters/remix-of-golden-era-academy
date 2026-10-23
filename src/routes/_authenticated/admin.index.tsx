import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/")({ component: AdminCourses });

function AdminCourses() {
  const q = useQuery({
    queryKey: ["admin", "courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, status, price, currency, duration, sort_order")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Courses</h1>
        <Button asChild><Link to="/admin/courses/new">Add course</Link></Button>
      </div>
      {q.error && <p className="mt-4 text-destructive">Could not load courses: {q.error.message}</p>}
      {q.data?.length === 0 && (
        <p className="mt-6 text-muted-foreground">No courses yet. Click "Add course" to create your first one.</p>
      )}
      <ul className="mt-6 divide-y divide-border rounded-lg border border-border">
        {q.data?.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="flex-1">
              <p className="font-medium text-foreground">{c.title}</p>
              <p className="text-sm text-muted-foreground">
                {c.price != null ? `${c.currency} ${c.price}` : "No price set"} · {c.duration || "No duration set"}
              </p>
            </div>
            <span className="rounded bg-muted px-2 py-1 text-xs capitalize text-foreground">{c.status}</span>
            <Button asChild size="sm" variant="outline">
              <Link to="/admin/courses/$id" params={{ id: c.id }}>Edit</Link>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
