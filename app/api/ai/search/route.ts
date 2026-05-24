import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey: apiKey || "mock_api_key",
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required." }, { status: 400 });
    }

    // Resilient Fallback: If OpenAI key is missing, perform standard text keyword searches
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY missing. Falling back to keyword search.");
      const { data, error } = await supabase
        .from("properties")
        .select("id, title, slug, address, base_price, capacity, images")
        .eq("is_published", true)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,address.ilike.%${query}%`)
        .limit(6);

      if (error) throw error;
      return NextResponse.json({ properties: data || [], isFallback: true });
    }

    // 1. Generate text embeddings from OpenAI API
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });

    const [{ embedding }] = embeddingResponse.data;

    // 2. Perform Cosine Similarity query via pgvector RPC
    const { data: properties, error: matchError } = await supabase.rpc(
      "match_properties",
      {
        query_embedding: embedding,
        match_threshold: 0.2, // Open bounds
        match_count: 6,
      }
    );

    if (matchError) {
      // Fallback to text match if database function is missing
      console.warn("Database RPC match_properties failed. Falling back to keyword search.", matchError);
      const { data, error } = await supabase
        .from("properties")
        .select("id, title, slug, address, base_price, capacity, images")
        .eq("is_published", true)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(6);

      if (error) throw error;
      return NextResponse.json({ properties: data || [], isFallback: true });
    }

    return NextResponse.json({ properties: properties || [] });

  } catch (err: any) {
    console.error("Vector search route error", err);
    return NextResponse.json({ error: err.message || "Vector search failed" }, { status: 500 });
  }
}
