import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import z from "zod";
import { queries } from "~/server/db/queries";
import { mutations } from "~/server/db/mutations";

const file = createUploadthing();

export const ourFileRouter = {
  driveUploader: file({
    blob: {
      maxFileSize: "1GB",
      maxFileCount: 9999,
    },
  })
    .input(
      z.object({
        folderId: z.string(),
      }),
    )
    .middleware(async ({ input }) => {
      const user = await auth();

      // eslint-disable-next-line @typescript-eslint/only-throw-error
      if (!user.userId) throw new UploadThingError("Unauthorized");

      const folder = await queries.getFolderById(input.folderId, user.userId);

      // eslint-disable-next-line @typescript-eslint/only-throw-error
      if (!folder) throw new UploadThingError("Folder not found");

      if (folder.ownerId !== user.userId)
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw new UploadThingError("Unauthorized");

      return { userId: user.userId, parentId: input.folderId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.ufsUrl);

      const createdFile = await mutations.createFile({
        file: {
          name: file.name,
          size: file.size,
          url: file.ufsUrl,
          parent: metadata.parentId,
        },
        userId: metadata.userId,
      });

      return { uploadedBy: metadata.userId, fileId: createdFile[0]?.id };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
