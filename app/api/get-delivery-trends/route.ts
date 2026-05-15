import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { userId } = await request.json();
  if (!userId) return NextResponse.json({ error: "userId fehlt" }, { status: 400 });

  const supabase = await createClient();
  
  // Get latest 2 checks per platform
  const { data, error } = await supabase
    .from("delivery_platform_ratings")
    .select("*")
    .eq("user_id", userId)
    .order("checked_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Group by platform and calculate trends
  const platforms = ["Lieferando.at", "Uber Eats", "Wolt", "Foodora"];
  const trends: Record<string, { 
    current: number | null; 
    previous: number | null; 
    trend: "↑" | "↓" | "→";
    change: number;
    lastChecked: string;
  }> = {};

  platforms.forEach((p) => {
    const platformData = (data as any[])?.filter((d) => d.platform === p) || [];
    if (platformData.length >= 1) {
      const current = platformData[0];
      const previous = platformData[1];
      
      const currentRating = current?.rating || null;
      const prevRating = previous?.rating || null;
      
      let trend: "↑" | "↓" | "→" = "→";
      let change = 0;
      
      if (currentRating && prevRating) {
        change = Math.round((currentRating - prevRating) * 10) / 10;
        if (change > 0.05) trend = "↑";
        else if (change < -0.05) trend = "↓";
      }
      
      trends[p] = {
        current: currentRating,
        previous: prevRating || null,
        trend,
        change,
        lastChecked: current?.checked_at || new Date().toISOString(),
      };
    }
  });

  return NextResponse.json({ trends, platforms });
}
