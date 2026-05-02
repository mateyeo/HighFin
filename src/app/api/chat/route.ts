import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { connectDB } from "@/backend/lib/db";
import { getAuthUser } from "@/backend/lib/jwt";
import { retrieveContext } from "@/backend/lib/retrieval";
import ChatMessageModel from "@/backend/models/ChatMessageModel";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are HighFin's educational finance assistant. Your role is to help students and complete beginners learn about personal finance and investing — clearly and simply.

Guidelines:
- Use plain English suitable for a high school student with no finance background.
- Keep most answers to 3–6 sentences. Use more only when a concept genuinely needs it.
- Use simple, everyday analogies whenever helpful (e.g. "a bond is like an IOU").
- When you cite a specific fact or statistic, name the source (Investopedia, SEC.gov, FINRA.org, IRS.gov, CFPB, Federal Reserve).
- If a question is vague, ask ONE short clarifying question before answering fully.
- Never recommend specific securities, funds by name, or trading strategies.
- Never claim to be a human expert or a licensed financial advisor.
- Do not fabricate statistics or claim to have real-time market data.
- If you are not certain of something, say so clearly.

End EVERY response with exactly this line (on its own line):
⚠️ Educational only — not personalized financial advice.`;

/** GET /api/chat — fetch message history for authenticated user */
export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuthUser(request);
    await connectDB();

    const messages = await ChatMessageModel.find({ userId })
      .sort({ createdAt: 1 })
      .limit(100)
      .lean();

    return NextResponse.json(
      messages.map((m) => ({
        id:        m._id.toString(),
        role:      m.role,
        content:   m.content,
        createdAt: m.createdAt.toISOString(),
      }))
    );
  } catch {
    return NextResponse.json([]);
  }
}

/** POST /api/chat — send a message and get an AI response */
export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "message is required." }, { status: 400 });
    }

    // Auth is optional — guests can chat but history isn't persisted
    let userId: string | null = null;
    try {
      userId = getAuthUser(request).userId;
    } catch {
      // anonymous session
    }

    // Retrieve relevant grounding context
    const context = retrieveContext(message);
    const contextBlock =
      context.length > 0
        ? "\n\n[Relevant context for your answer:\n" +
          context
            .map((c) => `- ${c.topic}: ${c.summary} (Source: ${c.source}, ${c.url})`)
            .join("\n") +
          "\nUse this context to inform your answer and cite these sources where relevant.]"
        : "";

    // Fetch conversation history for authenticated users (last 10 turns)
    let history: { role: "user" | "assistant"; content: string }[] = [];
    if (userId) {
      await connectDB();
      const recent = await ChatMessageModel.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
      history = recent
        .reverse()
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
    }

    const messages: { role: "user" | "assistant"; content: string }[] = [
      ...history,
      { role: "user", content: message + contextBlock },
    ];

    const aiResponse = await anthropic.messages.create({
      model:      "claude-sonnet-4-6",
      max_tokens: 1024,
      system:     SYSTEM_PROMPT,
      messages,
    });

    const assistantText =
      aiResponse.content[0].type === "text" ? aiResponse.content[0].text : "";

    // Persist messages for authenticated users
    if (userId) {
      await ChatMessageModel.create([
        { userId, role: "user",      content: message },
        { userId, role: "assistant", content: assistantText },
      ]);
    }

    return NextResponse.json({
      message: assistantText,
      sources: context.length > 0
        ? context.map((c) => ({ topic: c.topic, source: c.source, url: c.url }))
        : undefined,
    });
  } catch (err) {
    console.error("[POST /api/chat]", err);
    return NextResponse.json(
      { error: "Failed to get a response. Please try again." },
      { status: 500 }
    );
  }
}

/** DELETE /api/chat — clear history for authenticated user */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = getAuthUser(request);
    await connectDB();
    await ChatMessageModel.deleteMany({ userId });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
}
