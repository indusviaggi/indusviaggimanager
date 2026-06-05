import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth/session";

type RouteHandler = (
  req: NextRequest,
  context: { params: Record<string, string>; auth: { sub: string } | null }
) => Promise<NextResponse>;

const PUBLIC_PATHS = [
  "/api/users/authenticate",
  "/api/users/register",
];

export function createApiHandler(
  handlers: Partial<Record<string, RouteHandler>>,
  options?: { public?: boolean }
) {
  return async (
    req: NextRequest,
    context: { params?: Promise<Record<string, string>> }
  ) => {
    const method = req.method.toLowerCase();
    const handler = handlers[method];

    if (!handler) {
      return NextResponse.json(
        { message: `Method ${req.method} Not Allowed` },
        { status: 405 }
      );
    }

    try {
      const url = new URL(req.url);
      const isPublic =
        options?.public ||
        PUBLIC_PATHS.some((p) => url.pathname.endsWith(p.replace("/api", "")) || url.pathname.includes(p));

      let auth: { sub: string } | null = null;
      if (!isPublic) {
        auth = getAuthFromRequest(req);
        if (!auth) {
          return NextResponse.json({ message: "Invalid Token" }, { status: 401 });
        }
      } else {
        auth = getAuthFromRequest(req);
      }

      const params = context.params ? await context.params : {};
      return await handler(req, { params, auth });
    } catch (err) {
      return handleError(err);
    }
  };
}

export function handleError(err: unknown): NextResponse {
  if (typeof err === "string") {
    const is404 = err.toLowerCase().endsWith("not found");
    return NextResponse.json({ message: err }, { status: is404 ? 404 : 400 });
  }
  if (err instanceof Error) {
    console.error(err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
  return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
}
