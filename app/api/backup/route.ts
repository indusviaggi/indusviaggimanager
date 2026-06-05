import { NextResponse } from "next/server";
import JSZip from "jszip";
import { createApiHandler } from "@/lib/api/handler";
import { getUserById } from "@/lib/db/repositories/users.repository";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getCollections } = require("@/exportBackups.js");

export const GET = createApiHandler({
  get: async (_req, { auth }) => {
    if (!auth?.sub) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const user = await getUserById(auth.sub);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      return NextResponse.json(
        { message: "Database URI not configured." },
        { status: 500 }
      );
    }
    const collections = await getCollections(mongoUri);
    const zip = new JSZip();
    Object.entries(collections).forEach(([fileName, content]) => {
      zip.file(fileName, content as string);
    });
    const archive = await zip.generateAsync({ type: "nodebuffer" });
    const fileName = `backup_${new Date().toISOString().replace(/[:.]/g, "-")}.zip`;
    return new NextResponse(archive, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  },
});
