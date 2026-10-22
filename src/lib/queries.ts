import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export const coursesQueryOptions = queryOptions({
  queryKey: ["courses", "published"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("status", "published")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data;
  },
});

export const courseQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["courses", "detail", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("status", "published")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const siteSettingsQueryOptions = queryOptions({
  queryKey: ["site-settings"],
  queryFn: async () => {
    const { data, error } = await supabase.from("site_settings").select("key, value");
    if (error) throw error;
    return Object.fromEntries(data.map((row) => [row.key, row.value])) as Record<
      string,
      unknown
    >;
  },
});
