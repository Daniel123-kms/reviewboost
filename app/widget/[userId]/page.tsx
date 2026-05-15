import { createClient } from "@/lib/supabase/server";
import WidgetRenderer from "./WidgetRenderer";

export default async function Page({
  params,
  searchParams,
}: {
  params: { userId: string };
  searchParams: { theme?: string; max?: string };
}) {
  const supabase = await createClient();
  const max = Math.min(Math.max(parseInt(searchParams.max || "5"), 3), 10);

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id,author_name,platform,rating,content,created_at")
    .eq("user_id", params.userId)
    .order("rating", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(max);

  return (
    <WidgetRenderer
      reviews={reviews || []}
      theme={(searchParams.theme === "dark" ? "dark" : "light") as "light" | "dark"}
    />
  );
}
