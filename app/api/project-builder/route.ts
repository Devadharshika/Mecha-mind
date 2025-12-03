// app/api/project-builder/route.ts
import OpenAI from "openai";

type ProjectRequestBody = {
  goal?: string;
  hardware?: string;
  difficulty?: string;
  constraints?: string;
};

export async function POST(req: Request) {
  try {
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

    const body = (await req.json()) as ProjectRequestBody;
    const goal = body.goal?.trim() || "No specific goal provided";
    const hardware = body.hardware?.trim() || "Not specified";
    const difficulty = body.difficulty?.trim() || "Unspecified";
    const constraints = body.constraints?.trim() || "None";

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are MechaMind Project Builder, a robotics & AI project design specialist.

You do NOT chat casually. You only output clear, structured project blueprints.

Your reply MUST follow this structure:

1. Project Overview
2. Hardware & Components List
3. System Architecture (sensors, actuators, data flow)
4. Step-by-step Build Plan
5. Example Code Outline or Pseudocode
6. Testing Procedure
7. Extension Ideas (harder follow-ups)

Keep the style concise, technically solid, and aimed at a serious engineering student.
          `.trim(),
        },
        {
          role: "user",
          content: `
Design a project blueprint with the following parameters:

Goal:
${goal}

Hardware / Platform:
${hardware}

Difficulty:
${difficulty}

Extra Constraints:
${constraints}
        `.trim(),
        },
      ],
      temperature: 0.7,
    });

    const reply =
      completion.choices[0]?.message?.content ??
      "MechaMind Project Builder generated no response.";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Project Builder API error:", error);
    return new Response(
      JSON.stringify({
        error:
          "MechaMind Project Builder encountered an internal error. Please try again, Pilot.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
