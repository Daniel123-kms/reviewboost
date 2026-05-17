import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: reviews }, { data: businesses }] = await Promise.all([
    supabase.from("reviews").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("businesses").select("id,name,google_review_url,address,logo_url,brand_color,phone,category,place_id").eq("user_id", user.id).order("created_at"),
  ]);

  // Deduplicate by place_id (keep first occurrence)
  const seen = new Set<string>();
  const deduped = (businesses ?? []).filter((b) => {
    const key = b.place_id || b.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const activeBusiness = deduped[0] ?? null;
  const userName = activeBusiness?.name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Mein Betrieb";

  const businessesArray = deduped.map((b) => ({
    id: b.id,
    name: b.name,
    logoUrl: b.logo_url ?? null,
    brandColor: b.brand_color ?? null,
    googleReviewUrl: b.google_review_url ?? null,
    address: b.address ?? null,
    phone: b.phone ?? null,
    category: b.category ?? null,
  }));

  return (
    <DashboardClient
      user={{ id: user.id, email: user.email ?? "", name: userName }}
      initialReviews={reviews ?? []}
      hasBusinesses={deduped.length > 0}
      businessProfile={activeBusiness ? {
        name: activeBusiness.name,
        logoUrl: activeBusiness.logo_url ?? null,
        brandColor: activeBusiness.brand_color ?? null,
        googleReviewUrl: activeBusiness.google_review_url ?? null,
        address: activeBusiness.address ?? null,
        phone: activeBusiness.phone ?? null,
        category: activeBusiness.category ?? null,
      } : null}
      businesses={businessesArray}
    />
  );
}
