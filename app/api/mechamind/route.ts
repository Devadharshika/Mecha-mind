// app/api/mechamind/route.ts
import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";

type ChatSender = "user" | "ai";

type MechaRequestBody = {
  message?: string;
  history?: { sender: ChatSender; text: string }[];
};

type MemoryStore = {
  facts: string[];
};

const MEMORY_FILE = path.join(process.cwd(), "memory.json");

// ---- Memory helpers ----
async function loadMemory(): Promise<MemoryStore> {
  try {
    const data = await fs.readFile(MEMORY_FILE, "utf-8");
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed.facts)) {
      return { facts: parsed.facts };
    }
    return { facts: [] };
  } catch {
    return { facts: [] };
  }
}

async function saveMemory(memory: MemoryStore) {
  await fs.writeFile(MEMORY_FILE, JSON.stringify(memory, null, 2), "utf-8");
}

// ---- GET for debugging / status ----
export async function GET() {
  const hasKey = !!process.env.OPENAI_API_KEY;
  const memory = await loadMemory();

  return new Response(
    JSON.stringify({
      status: hasKey ? "OK" : "MISSING_KEY",
      detail: hasKey
        ? "MechaMind API online. OPENAI_API_KEY is set."
        : "OPENAI_API_KEY is NOT visible to the server.",
      memoryFacts: memory.facts,
    }),
    {
      status: hasKey ? 200 : 500,
      headers: { "Content-Type": "application/json" },
    }
  );
}

// ---- POST: main chat logic ----
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as MechaRequestBody;
    const message = body.message?.trim();
    const history = body.history ?? [];

    if (!message) {
      return new Response(
        JSON.stringify({ error: "No message provided" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const lower = message.toLowerCase();

    // ---------- INTENTIONAL MEMORY: "remember this:" ----------
    if (lower.startsWith("remember this:") || lower.startsWith("remember:")) {
      const firstColon = message.indexOf(":");
      const fact = message.slice(firstColon + 1).trim();

      if (!fact) {
        return new Response(
          JSON.stringify({
            reply:
              "Pilot, you asked me to remember something, but I don't see any detail after the colon. Try: `remember this: my major is robotics`.",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      const memory = await loadMemory();
      const alreadyExists = memory.facts.some(
        (f) => f.toLowerCase() === fact.toLowerCase()
      );

      if (!alreadyExists) {
        memory.facts.push(fact);
        await saveMemory(memory);
      }

      return new Response(
        JSON.stringify({
          reply: `Acknowledged, Pilot. I will remember: "${fact}".`,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // ---------- INTENTIONAL FORGET: "forget:" ----------
    if (lower.startsWith("forget:")) {
      const firstColon = message.indexOf(":");
      const fragment = message.slice(firstColon + 1).trim();

      if (!fragment) {
        return new Response(
          JSON.stringify({
            reply:
              "Pilot, you asked me to forget something, but I don't see what. Try: `forget: my major`.",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      const memory = await loadMemory();
      const beforeCount = memory.facts.length;

      const filtered = memory.facts.filter(
        (f) => !f.toLowerCase().includes(fragment.toLowerCase())
      );

      memory.facts = filtered;
      await saveMemory(memory);

      const removedCount = beforeCount - filtered.length;

      if (removedCount === 0) {
        return new Response(
          JSON.stringify({
            reply:
              "I scanned my memory, Pilot, but I couldn't find anything matching that to forget.",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          reply: `Affirmative. I have cleared ${removedCount} stored fact${
            removedCount > 1 ? "s" : ""
          } related to that.`,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // ---------- Normal chat with MechaMind + memory context ----------

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is missing on the server.");
      return new Response(
        JSON.stringify({
          error:
            "Server is missing OPENAI_API_KEY. Configure it in .env.local and restart.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const memory = await loadMemory();
    const memoryText =
      memory.facts.length > 0
        ? `These are long-term facts about the user that you should respect and use when relevant:\n${memory.facts
            .map((f) => `- ${f}`)
            .join("\n")}`
        : "You currently have no long-term stored facts about the user. You still have access to the recent conversation messages below.";

    // build conversation messages from history
    const historyMessages = history.map((h) => ({
      role: h.sender === "user" ? ("user" as const) : ("assistant" as const),
      content: h.text,
    }));

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // upgradeable later
      messages: [
        {
          role: "system",
          content: `
You are MechaMind AI — the AI Engineering & Robotics Super Assistant.

Brand:
- Tagline: "Where AI meets real engineering."
- Core: Teaches. Builds. Simulates. Guides.

Voice:
- Smart, precise, and engineering-focused.
- Serious but inspiring — never childish.
- Address the user as "Pilot".
- Prefer clear structure with short paragraphs and bullet points.

Behavior:
- For robotics, AI, math, and programming questions, explain step-by-step.
- When useful, propose practical projects, simulations, or experiments.
- If the user references "before" or "earlier", use conversation history to resolve it.
- If still ambiguous, ask a brief clarification instead of guessing.
        `.trim(),
        },
        {
          role: "system",
          content: memoryText,
        },
        ...historyMessages,
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
    });

    const reply =
      completion.choices[0]?.message?.content ??
      "Systems error: MechaMind could not generate a response.";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("MechaMind API error:", error);

    return new Response(
      JSON.stringify({
        error:
          "MechaMind encountered an internal error. Please try again, Pilot.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
