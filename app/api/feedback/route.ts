import { NextResponse } from "next/server";
import OpenAI from "openai";


export async function POST(req: Request) {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { chatHistory, lang } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a strict senior engineering manager. Evaluate this candidate's technical interview performance based on the chat history. Provide a final, objective assessment. You MUST write all text fields (strengths, weaknesses, tips) in the following language: ${lang === "pt" ? "Brazilian Portuguese" : lang === "es" ? "Spanish" : "English"}.`
        },
        ...chatHistory
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "FeedbackMatrix",
          strict: true,
          schema: {
            type: "object",
            properties: {
              technicalScore: { type: "number", description: "Score out of 10" },
              strengths: { type: "array", items: { type: "string" } },
              weaknesses: { type: "array", items: { type: "string" } },
              tips: { type: "array", items: { type: "string" } }
            },
            required: ["technicalScore", "strengths", "weaknesses", "tips"],
            additionalProperties: false
          }
        }
      }
    });

    const feedback = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Feedback API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate feedback", detail: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
}