import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  // Stub: Task A endpoint for user simulation (reviews + ratings)
  return Response.json({
    task: "A",
    status: "not_implemented",
    message: "User Simulator agent not yet implemented (Day 6)",
  });
}
