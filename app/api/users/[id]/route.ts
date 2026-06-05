import { NextRequest, NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api/handler";
import {
  getUserById,
  updateUser,
  deleteUser,
} from "@/lib/db/repositories/users.repository";

export const GET = createApiHandler({
  get: async (_req, { params }) => {
    const user = await getUserById(params.id);
    return NextResponse.json(user);
  },
});

export const PUT = createApiHandler({
  put: async (req, { params }) => {
    const body = await req.json();
    await updateUser(params.id, body);
    return NextResponse.json({});
  },
});

export const DELETE = createApiHandler({
  delete: async (_req, { params }) => {
    await deleteUser(params.id);
    return NextResponse.json({});
  },
});
