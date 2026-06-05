import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/db/repositories/users.repository";
import { setSessionCookie } from "@/lib/auth/session";
import { handleError } from "@/lib/api/handler";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const user = await authenticateUser(body);
    await setSessionCookie(user.token);
    const { token, ...userWithoutToken } = user;
    return NextResponse.json({ ...userWithoutToken, token });
  } catch (err) {
    return handleError(err);
  }
}
