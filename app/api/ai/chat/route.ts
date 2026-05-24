import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.warn("OPENAI_API_KEY is missing. AI Concierge will fall back to rule checking.");
}

const openai = new OpenAI({
  apiKey: apiKey || "mock_api_key",
});

export async function POST(request: NextRequest) {
  try {
    const { message, rules = [], description = "" } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message content is required." }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: "OpenAI credentials missing. Configure OPENAI_API_KEY in .env.local to enable chatbot completions." 
      }, { status: 503 });
    }

    const systemPrompt = `
You are a helpful, hospitable AI Stay Concierge chatbot representing a premium farmhouse stay. 
Your goal is to answer guest questions accurately and concisely using ONLY the property description and rules provided below.

Property Context:
-----------------
Description: 
${description}

House Rules & Guidelines:
${rules.length > 0 ? rules.map((r: string) => `- ${r}`).join("\n") : "No specific house rules listed."}
-----------------

Instructions:
1. Answer queries strictly based on the context. If the answer is not mentioned or cannot be inferred from the rules/description, politely say: "I do not have that specific information. I'd be happy to connect you with the host to double check!"
2. Keep answers short, friendly, and under 3 sentences.
3. Be warm and welcoming.
`;

    // Query OpenAI Completions
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Cost efficient & fast response
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      max_tokens: 150,
      temperature: 0.5,
    });

    const reply = completion.choices[0].message?.content || "I'm sorry, I couldn't synthesize a response.";

    return NextResponse.json({ reply });

  } catch (err: any) {
    console.error("AI Chatbot completion error", err);
    return NextResponse.json({ error: err.message || "Failed to process chat response." }, { status: 500 });
  }
}
