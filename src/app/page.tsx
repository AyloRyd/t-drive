import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { folders_table } from "~/server/db/schema";

export default async function Page() {
  const rootFolder = (
    await db.select().from(folders_table).where(eq(folders_table.name, "root"))
  )[0];

  if (!rootFolder) {
    throw new Error("Root folder not found");
  }

  redirect(`/f/${rootFolder.id}`);
}
