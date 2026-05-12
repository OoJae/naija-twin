import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  // Stub: will wire to Vercel AI SDK ToolLoopAgent with MCP tools
  return Response.json({
    role: "assistant",
    content: "Chat endpoint ready. Agent loop not yet implemented.",
  });
}
