export type DriveItemType = "file" | "folder";

export interface SelectedDriveItem {
  id: string;
  type: DriveItemType;
}
