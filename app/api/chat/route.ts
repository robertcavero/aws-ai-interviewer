import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const LANG_NAMES: Record<string, string> = { pt: "Portuguese", es: "Spanish", en: "English" };

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function POST(req: NextRequest) {
  try {
    const { jobDescription, chatHistory, lang = "pt" } = await req.json();
    const language = LANG_NAMES[lang] ?? "Portuguese";

    const sanitizedHistory = chatHistory.map((msg: ChatMessage) => ({
      role: msg.role,
      content: msg.content,
    }));

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a strict, senior Lead Software Engineer conducting a deep technical interview. Review the job description and the candidate's answers.

          Your goal is to test the candidate's actual engineering depth, not surface-level knowledge.
          Ask exactly ONE highly specific, scenario-based technical question.

          RULES:
          - Drill down into architecture, system design, trade-offs, or specific framework mechanics.
          - If the candidate mentions a technology, ask a hard technical question about HOW it works under the hood or how to solve a specific edge case with it.
          - NO generic HR questions (e.g., do not ask "Tell me about a time...", "What are the benefits of...", or "How do you handle challenges?").
          - Jump directly into the question text. No conversational filler. No numbering.
          - You MUST respond in ${language}.

          Job Description: ${jobDescription}`,
        },
        ...sanitizedHistory,
      ],
      temperature: 0.7,
    });

    const message = completion.choices[0].message.content;
    return NextResponse.json({ message });
  } catch (error) {
    console.error("OpenAI Error:", error);
    return NextResponse.json(
      { error: "Failed to generate interview question" },
      { status: 500 },
    );
  }
}
