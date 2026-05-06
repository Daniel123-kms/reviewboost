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

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Benutzer";

  return (
    <DashboardClient
      user={{ id: user.id, email: user.email ?? "", name: userName }}
      initialReviews={reviews ?? []}
    />
  );
}
