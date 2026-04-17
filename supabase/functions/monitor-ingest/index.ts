// supabase/functions/monitor-ingest/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const INGEST_API_KEY = Deno.env.get("STRATEIS_INGEST_KEY") || "strateis-ingest-2026-prod";

interface IngestPayload {
  source: string;
  category: string;
  timestamp?: string;
  data: Record<string, any>;
}

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== INGEST_API_KEY) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const payload: IngestPayload = await req.json();

    if (!payload.source || !payload.category || !payload.data) {
      return new Response(JSON.stringify({ error: "Missing required fields: source, category, data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result;

    switch (payload.category) {
      case "seo_daily":
        result = await supabase.from("monitor_seo_daily").upsert({
          date: payload.data.date || new Date().toISOString().split("T")[0],
          ideelab_indexed: payload.data.ideelab_indexed,
          strateis_indexed: payload.data.strateis_indexed,
          monitor_indexed: payload.data.monitor_indexed,
          source: payload.source,
          raw_data: payload.data,
        }, { onConflict: "date" });
        break;

      case "ranking_weekly":
        result = await supabase.from("monitor_ranking_weekly").upsert({
          week_start: payload.data.week_start,
          ranking_score_ideelab: payload.data.ranking_score_ideelab,
          ranking_score_strateis: payload.data.ranking_score_strateis,
          keywords_detail: payload.data.keywords_detail,
          source: payload.source,
        }, { onConflict: "week_start" });
        break;

      case "aeo_weekly":
        result = await supabase.from("monitor_aeo_weekly").upsert({
          week_start: payload.data.week_start,
          visibility_score: payload.data.visibility_score,
          queries_detail: payload.data.queries_detail,
          source: payload.source,
        }, { onConflict: "week_start" });
        break;

      case "b2g_opportunity":
        result = await supabase.from("monitor_b2g_pipeline").upsert({
          opportunity_name: payload.data.opportunity_name,
          funder: payload.data.funder,
          score: payload.data.score,
          deadline: payload.data.deadline,
          amount_fcfa: payload.data.amount_fcfa,
          status: payload.data.status || "detected",
          description: payload.data.description,
          source_url: payload.data.source_url,
          source: payload.source,
        }, { onConflict: "opportunity_name" });
        break;

      case "concurrent":
        result = await supabase.from("monitor_concurrents").upsert({
          name: payload.data.name,
          sector: payload.data.sector,
          positioning: payload.data.positioning,
          country: payload.data.country,
          last_activity_date: payload.data.last_activity_date,
          last_activity_note: payload.data.last_activity_note,
          source: payload.source,
        }, { onConflict: "name" });
        break;

      case "rdue_event":
        result = await supabase.from("monitor_rdue_timeline").insert({
          event_date: payload.data.event_date,
          event_name: payload.data.event_name,
          event_type: payload.data.event_type,
          description: payload.data.description,
          strateis_phase: payload.data.strateis_phase,
          next_action: payload.data.next_action,
          source: payload.source,
        });
        break;

      case "feed_item":
        result = await supabase.from("monitor_feed_items").upsert({
          source: payload.data.source_name,
          category: payload.data.feed_category,
          title: payload.data.title,
          url: payload.data.url,
          summary: payload.data.summary,
          published_at: payload.data.published_at,
          tier: payload.data.tier || 3,
          tags: payload.data.tags,
          collector: payload.source,
        }, { onConflict: "url" });
        break;

      case "kpis_daily":
        result = await supabase.from("monitor_kpis_daily").upsert({
          date: payload.data.date || new Date().toISOString().split("T")[0],
          total_ideas: payload.data.total_ideas,
          active_projects: payload.data.active_projects,
          monthly_revenue: payload.data.monthly_revenue,
          paystack_transactions_count: payload.data.paystack_transactions_count,
          raw_metrics: payload.data,
          source: payload.source,
        }, { onConflict: "date" });
        break;

      default:
        return new Response(JSON.stringify({ error: `Unknown category: ${payload.category}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    if (result.error) {
      throw result.error;
    }

    await supabase.from("monitor_source_health").upsert({
      source_id: payload.source,
      source_name: payload.source,
      last_success: new Date().toISOString(),
    }, { onConflict: "source_id" });

    return new Response(JSON.stringify({
      ok: true,
      category: payload.category,
      source: payload.source,
      ingested_at: new Date().toISOString(),
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Ingest error:", error);

    try {
      const bodyText = await req.clone().text();
      const parsed = JSON.parse(bodyText);
      if (parsed.source) {
        const supa = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );
        await supa.from("monitor_source_health").upsert({
          source_id: parsed.source,
          source_name: parsed.source,
          last_failure: new Date().toISOString(),
          failure_message: error.message,
        }, { onConflict: "source_id" });
      }
    } catch (_) { /* ignore */ }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
