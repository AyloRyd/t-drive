import {
  pgTable,
  text,
  timestamp,
  uuid,
  index,
  integer,
} from "drizzle-orm/pg-core";

export const files_table = pgTable(
  "files_table",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull(),
    name: text("name").notNull(),
    size: integer("size").notNull(),
    url: text("url").notNull(),
    parent: text("parent").notNull(),
    created_at: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => {
    return [
      index("files_parent_index").on(t.parent),
      index("files_owner_id_index").on(t.ownerId),
    ];
  },
);

export type DBFileType = typeof files_table.$inferSelect;

export const folders_table = pgTable(
  "folders_table",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull(),
    name: text("name").notNull(),
    parent: text("parent"),
    created_at: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => {
    return [
      index("folders_parent_index").on(t.parent),
      index("folders_owner_id_index").on(t.ownerId),
    ];
  },
);

export type DBFolderType = typeof folders_table.$inferSelect;
