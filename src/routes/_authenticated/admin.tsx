import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin | Golden Era Digital Academy" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const access = useQuery({
    queryKey: ["my-access"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("my_access");
      if (error) throw error;
      return data as { roles?: string[]; permissions?: string[]; is_staff?: boolean } | null;
    },
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (access.isLoading) return <p className="p-8 text-muted-foreground">Loading…</p>;
  const roles = access.data?.roles ?? [];
  const isStaff = roles.includes("super_admin") || roles.includes("admin");
  if (!isStaff) {
    return (
      <main className="mx-auto max-w-md p-8 text-center">
        <h1 className="text-xl font-semibold text-foreground">No admin access</h1>
        <p className="mt-2 text-sm text-muted-foreground">This account isn't an administrator.</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button asChild variant="outline"><Link to="/">Home</Link></Button>
          <Button onClick={signOut}>Sign out</Button>
        </div>
      </main>
    );
  }

  const link = "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground";
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
          <Link to="/admin" className="mr-4 font-display font-semibold text-primary">GE Admin</Link>
          <Link to="/admin" activeOptions={{ exact: true }} className={link} activeProps={{ className: "text-primary" }}>Courses</Link>
          <Link to="/admin/settings" className={link} activeProps={{ className: "text-primary" }}>Settings</Link>
          <Link to="/" className={link}>View site</Link>
          <Button size="sm" variant="outline" className="ml-auto" onClick={signOut}>Sign out</Button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6"><Outlet /></main>
    </div>
  );
}
