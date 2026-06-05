import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api/handler";
import { getAllUsers } from "@/lib/db/repositories/users.repository";

export const GET = createApiHandler({
  get: async () => {
    const users = await getAllUsers();
    return NextResponse.json(users);
  },
});
