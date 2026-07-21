import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { appData } from "../../db/schema.js";

const allowedKeys = new Set([
  "products",
  "orders",
  "shopkeepers",
  "routes",
  "salesmen",
  "ownerPin",
]);

export default async (request: Request) => {
  try {
    if (request.method === "GET") {
      const rows = await db.select().from(appData);
      return Response.json(Object.fromEntries(rows.map((row) => [row.key, row.value])));
    }

    if (request.method === "POST") {
      const body = await request.json() as { key?: unknown; value?: unknown };

      if (typeof body.key !== "string" || !allowedKeys.has(body.key) || body.value === undefined) {
        return Response.json({ error: "Invalid data key or value" }, { status: 400 });
      }

      await db
        .insert(appData)
        .values({ key: body.key, value: body.value })
        .onConflictDoUpdate({
          target: appData.key,
          set: { value: body.value, updatedAt: new Date() },
        });

      return Response.json({ saved: true });
    }

    return new Response("Method not allowed", {
      status: 405,
      headers: { Allow: "GET, POST" },
    });
  } catch (error) {
    console.error("Data API error", error);
    return Response.json({ error: "Unable to access saved data" }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/data",
};
