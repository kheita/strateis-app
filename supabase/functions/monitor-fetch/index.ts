// supabase/functions/monitor-fetch/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const view = url.searchParams.get("view");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
  );

  try {
    let data: any = {};

    switch (view) {
      case "dashboard": {
        const [seoLatest, kpisLatest, b2gOpen, healthList] = await Promise.all([
          supabase.from("monitor_seo_daily").select("*").order("date", { ascending: false }).limit(30),
          supabase.from("monitor_kpis_daily").select("*").order("date", { ascending: false }).limit(1),
          supabase.from("monitor_b2g_pipeline").select("*").in("status", ["detected", "qualified"]).order("score", { ascending: false }).limit(5),
          supabase.from("monitor_source_health").select("*").order("source_id"),
        ]);

        data = {
          seo: seoLatest.data ?? [],
          kpis: kpisLatest.data?.[0] ?? null,
          b2g_hot: b2gOpen.data ?? [],
          sources_health: healthList.data ?? [],
        };
        break;
      }

      case "status": {
        const health = await supabase.from("monitor_source_health").select("*").order("is_critical", { ascending: false });
        const alerts = await supabase.from("monitor_alerts").select("*").eq("acknowledged", false).order("triggered_at", { ascending: false }).limit(20);
        data = { sources: health.data ?? [], alerts: alerts.data ?? [] };
        break;
      }

      case "feeds": {
        const category = url.searchParams.get("category") || "africa_tech";
        const limit = parseInt(url.searchParams.get("limit") || "20");
        const feeds = await supabase.from("monitor_feed_items")
          .select("*")
          .eq("category", category)
          .order("published_at", { ascending: false })
          .limit(limit);
        data = { items: feeds.data ?? [] };
        break;
      }

      case "b2g": {
        const b2g = await supabase.from("monitor_b2g_pipeline")
          .select("*")
          .order("deadline", { ascending: true });
        data = { pipeline: b2g.data ?? [] };
        break;
      }

      case "rdue": {
        const rdue = await supabase.from("monitor_rdue_timeline")
          .select("*")
          .order("event_date", { ascending: true });
        const concurrents = await supabase.from("monitor_concurrents")
          .select("*")
          .order("last_activity_date", { ascending: false });
        data = { timeline: rdue.data ?? [], concurrents: concurrents.data ?? [] };
        break;
      }

      case "seo": {
        const seoData = await supabase.from("monitor_seo_daily").select("*").order("date", { ascending: false }).limit(90);
        const ranking = await supabase.from("monitor_ranking_weekly").select("*").order("week_start", { ascending: false }).limit(12);
        const aeo = await supabase.from("monitor_aeo_weekly").select("*").order("week_start", { ascending: false }).limit(12);
        data = { daily: seoData.data ?? [], ranking: ranking.data ?? [], aeo: aeo.data ?? [] };
        break;
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown view: ${view}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify({ view, data, fetched_at: new Date().toISOString() }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60",
      },
    });

  } catch (error) {
    console.error("Fetch error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
