import { useRouter } from "next/navigation";
import type { SelectedDriveItem } from "~/lib/types";
import {
  moveToTrash,
  restoreFromTrash,
} from "~/server/actions/trash.actions";
import { useToast } from "./use-toast";

/**
 * Moves items to trash and offers an Undo. Trashing is recoverable for the
 * whole retention window, so it skips the confirm dialog that permanent
 * deletion still gets.
 */
export function useMoveToTrash() {
  const router = useRouter();
  const showToast = useToast((state) => state.showToast);

  const undo = async (items: SelectedDriveItem[]) => {
    const restored = await restoreFromTrash(items);
    router.refresh();
    if (!restored.success) showToast({ message: "Couldn't undo" });
  };

  return async (items: SelectedDriveItem[], name?: string) => {
    const result = await moveToTrash(items);
    if (!result.success) {
      showToast({ message: "Couldn't move to trash" });
      return false;
    }

    router.refresh();

    const { count } = result.data;
    const single = count === 1 && name;
    showToast({
      subject: single ? `“${name}”` : undefined,
      message: single
        ? "moved to trash"
        : `${count} ${count === 1 ? "item" : "items"} moved to trash`,
      action: {
        label: "Undo",
        onClick: () => void undo(items),
      },
    });
    return true;
  };
}
