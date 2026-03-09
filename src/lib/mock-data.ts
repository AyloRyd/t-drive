export type Folder = {
  name: string;
  parent: string | null;
};

export const mockFolders: Folder[] = [
  { name: "Documents", parent: "root" },
  { name: "Images", parent: "root" },
  { name: "Work", parent: "root" },
  { name: "Presentations", parent: "root" },
];
