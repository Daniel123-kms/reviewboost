import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: reviews }, { data: businesses }] = await Promise.all([
    supabase.from("reviews").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("businesses").select("id,name,google_review_url,address,logo_url,brand_color,phone,category").eq("user_id", user.id).order("created_at").limit(1),
  ]);

  const activeBusiness = businesses?.[0] ?? null;
  const userName = activeBusiness?.name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Mein Betrieb";

  return (
    <DashboardClient
      user={{ id: user.id, email: user.email ?? "", name: userName }}
      initialReviews={reviews ?? []}
      hasBusinesses={(businesses?.length ?? 0) > 0}
      businessProfile={activeBusiness ? {
        name: activeBusiness.name,
        logoUrl: activeBusiness.logo_url ?? null,
        brandColor: activeBusiness.brand_color ?? null,
        googleReviewUrl: activeBusiness.google_review_url ?? null,
        address: activeBusiness.address ?? null,
        phone: activeBusiness.phone ?? null,
        category: activeBusiness.category ?? null,
      } : null}
    />
  );
}
