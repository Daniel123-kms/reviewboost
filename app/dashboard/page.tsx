import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: reviews }, { count: businessCount }] = await Promise.all([
    supabase.from("reviews").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("businesses").select("*", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Benutzer";

  return (
    <DashboardClient
      user={{ id: user.id, email: user.email ?? "", name: userName }}
      initialReviews={reviews ?? []}
      hasBusinesses={(businessCount ?? 0) > 0}
    />
  );
}
