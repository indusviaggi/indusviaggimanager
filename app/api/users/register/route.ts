import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/lib/db/repositories/users.repository";
import { handleError } from "@/lib/api/handler";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await createUser(body);
    return NextResponse.json({});
  } catch (err) {
    return handleError(err);
  }
}
