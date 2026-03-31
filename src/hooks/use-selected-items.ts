import { create } from "zustand";
import type { SelectedDriveItem } from "~/lib/types";

interface SelectedItemsStore {
  selectedItems: SelectedDriveItem[];
  toggleSelect: (item: SelectedDriveItem) => void;
  selectAll: (items: SelectedDriveItem[]) => void;
  clearSelection: () => void;
}

export const useSelectedItems = create<SelectedItemsStore>((set) => ({
  selectedItems: [],
  toggleSelect: ({ id, type }) =>
    set((state) => {
      const isSelected = state.selectedItems.some(
        (item) => item.id === id && item.type === type,
      );
      if (isSelected) {
        return {
          selectedItems: state.selectedItems.filter(
            (item) => !(item.id === id && item.type === type),
          ),
        };
      } else {
        return { selectedItems: [...state.selectedItems, { id, type }] };
      }
    }),
  selectAll: (items) => set({ selectedItems: items }),
  clearSelection: () => set({ selectedItems: [] }),
}));
