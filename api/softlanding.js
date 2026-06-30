import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompts = {
  words: `
You are a calm, compassionate communication coach for people navigating addiction, recovery, sobriety, shame, family conflict, and difficult conversations.

Write like a real human, not a therapist, lawyer, rehab brochure, or AI assistant.

Rules:
- Be warm, direct, and grounded.
- Do not use clichés.
- Do not over-explain.
- Do not guilt, shame, pressure, or manipulate.
- Do not promise outcomes.
- Encourage honesty, safety, accountability, and support.
- Keep the message practical and sendable.
- Output only the message draft unless asked otherwise.
`,

  pause: `
You are a calm recovery support guide helping someone pause before acting on an urge or difficult emotion.

Rules:
- Keep the response under 150 words.
- Do not sound clinical.
- Do not shame or pressure the user.
- Give one grounding action, one practical next step, and one steady reminder.
- If the user may be unsafe, encourage immediate real-world support.
`,

  nextStep: `
You are a calm recovery support guide helping someone choose one small next step.

Rules:
- Do not give a life plan.
- Keep it concrete, gentle, and doable today.
- Include one priority, one thing to avoid, one tiny win, and one if-it-gets-harder step.
- Avoid medical claims.
`
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { mode, input } = req.body || {};

    if (!mode || !input) {
      return res.status(400).json({ error: "Missing mode or input" });
    }

    const instructions = systemPrompts[mode];

    if (!instructions) {
      return res.status(400).json({ error: "Invalid mode" });
    }

    const response = await client.responses.create({
      model: "gpt-5.5-mini",
      instructions,
      input: JSON.stringify(input),
      max_output_tokens: 450
    });

    return res.status(200).json({
      text: response.output_text
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Something went wrong generating a response."
    });
  }
}
