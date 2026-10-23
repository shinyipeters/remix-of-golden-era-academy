import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/admin/settings")({ component: Settings });

const GROUPS: { key: string; title: string; fields: { name: string; label: string; area?: boolean }[] }[] = [
  { key: "contact", title: "Public contact details", fields: [
    { name: "email", label: "Official email" },
    { name: "whatsapp", label: "WhatsApp number (with country code, e.g. 2348012345678)" },
    { name: "phone", label: "Phone (optional)" },
    { name: "address", label: "Address (optional)", area: true },
  ] },
  { key: "bank", title: "Bank / payment details", fields: [
    { name: "bank_name", label: "Bank name" },
    { name: "account_name", label: "Account name" },
    { name: "account_number", label: "Account number" },
    { name: "instructions", label: "Payment instructions", area: true },
  ] },
  { key: "social", title: "Social media links", fields: [
    { name: "facebook", label: "Facebook URL" },
    { name: "instagram", label: "Instagram URL" },
    { name: "tiktok", label: "TikTok URL" },
    { name: "x", label: "X (Twitter) URL" },
    { name: "youtube", label: "YouTube URL" },
  ] },
];

function Settings() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("key, value");
      if (error) throw error;
      return Object.fromEntries(data.map((r) => [r.key, (r.value ?? {}) as Record<string, string>]));
    },
  });

  async function save(key: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const value = Object.fromEntries([...f.entries()].map(([k, v]) => [k, String(v).trim()])) as Json;
    const { error } = await supabase.from("site_settings").upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) return toast.error(`Not saved: ${error.message}`);
    toast.success("Saved");
    qc.invalidateQueries({ queryKey: ["site-settings"] });
    qc.invalidateQueries({ queryKey: ["admin", "settings"] });
  }

  if (q.isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (q.error) return <p className="text-destructive">Could not load settings: {q.error.message}</p>;

  return (
    <div className="max-w-2xl space-y-10">
      <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
      {GROUPS.map((g) => (
        <form key={g.key} onSubmit={(e) => save(g.key, e)} className="space-y-4 rounded-lg border border-border p-5">
          <h2 className="text-lg font-semibold text-primary">{g.title}</h2>
          {g.fields.map((fd) => (
            <div key={fd.name} className="space-y-1.5">
              <Label htmlFor={`${g.key}-${fd.name}`}>{fd.label}</Label>
              {fd.area ? (
                <Textarea id={`${g.key}-${fd.name}`} name={fd.name} defaultValue={q.data?.[g.key]?.[fd.name] ?? ""} />
              ) : (
                <Input id={`${g.key}-${fd.name}`} name={fd.name} defaultValue={q.data?.[g.key]?.[fd.name] ?? ""} />
              )}
            </div>
          ))}
          <Button type="submit">Save {g.title.toLowerCase()}</Button>
        </form>
      ))}
    </div>
  );
}
