import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api/handler";
import { getUserById } from "@/lib/db/repositories/users.repository";

export const GET = createApiHandler({
  get: async (_req, { auth }) => {
    if (!auth?.sub) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const user = await getUserById(auth.sub);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(user.toJSON());
  },
});
