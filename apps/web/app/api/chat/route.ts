import { NextRequest } from "next/server";
import { getLangfuse } from "@/lib/langfuse";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const langfuse = getLangfuse();

  const trace = langfuse.trace({
    name: "chat",
    sessionId: "test-session",
    input: messages,
  });

  const response =
    "Langfuse trace pipeline verified. Agent loop not yet implemented.";

  trace.update({ output: response });
  langfuse.flushAsync();

  return Response.json({ role: "assistant", content: response });
}
