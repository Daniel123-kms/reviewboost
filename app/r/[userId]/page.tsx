import { createClient } from "@/lib/supabase/server";
import FunnelPage from "./FunnelPage";

export default async function Page({ params, searchParams }: { params: { userId: string }; searchParams: { business?: string; link?: string } }) {
  // Load business profile for personalization
  const supabase = await createClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("name,logo_url,brand_color,google_review_url")
    .eq("user_id", params.userId)
    .order("created_at")
    .limit(1)
    .maybeSingle();

  const businessName = business?.name || (searchParams.business ? decodeURIComponent(searchParams.business) : "Unser Betrieb");
  const googleLink = business?.google_review_url || (searchParams.link ? decodeURIComponent(searchParams.link) : "");

  return (
    <FunnelPage
      userId={params.userId}
      businessName={businessName}
      googleLink={googleLink}
      logoUrl={business?.logo_url ?? null}
      brandColor={business?.brand_color ?? null}
    />
  );
}
