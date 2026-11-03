"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, RotateCcw, Trash2, X } from "lucide-react";
import { Checkbox } from "~/components/ui/checkbox";
import { useToast } from "~/hooks/use-toast";
import { TRASH_RETENTION_DAYS, type TrashItem } from "~/lib/trash";
import type { SelectedDriveItem } from "~/lib/types";
import { formatDate, formatSize } from "~/lib/utils";
import {
  deleteItemsForever,
  emptyTrashAction,
  restoreFromTrash,
} from "~/server/actions/trash.actions";
import { ConfirmDialog } from "../f/[folderId]/components/confirm-dialog";
import DriveHeader from "../f/[folderId]/components/drive-header";
import { FileIcon } from "../f/[folderId]/components/file-icon";

const keyOf = (item: { type: string; id: string }) => `${item.type}:${item.id}`;

const refsOf = (items: TrashItem[]): SelectedDriveItem[] =>
  items.map(({ id, type }) => ({ id, type }));

function plural(count: number) {
  return `${count} ${count === 1 ? "item" : "items"}`;
}

export function TrashContents({
  items,
  rootFolderId,
}: {
  items: TrashItem[];
  rootFolderId: string;
}) {
  const router = useRouter();
  const showToast = useToast((state) => state.showToast);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  // Derived from the current list, so items that vanish after a refresh
  // drop out of the selection on their own.
  const selected = items.filter((item) => selectedKeys.has(keyOf(item)));
  const someSelected = selected.length > 0;
  const allSelected = items.length > 0 && selected.length === items.length;

  const toggle = (item: TrashItem) =>
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      const key = keyOf(item);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const describe = (list: TrashItem[]) =>
    list.length === 1 ? { subject: `“${list[0]!.name}”` } : {};

  const restore = async (list: TrashItem[]) => {
    setBusy(true);
    try {
      const result = await restoreFromTrash(refsOf(list));
      if (!result.success) {
        showToast({ message: "Couldn't restore" });
        return;
      }
      const { restored, movedToRoot } = result.data;
      const what = list.length === 1 ? "restored" : `${plural(restored)} restored`;
      showToast({
        ...describe(list),
        message:
          movedToRoot === 0
            ? what
            : movedToRoot === restored
              ? `${what} to My Drive`
              : `${what}, ${movedToRoot} to My Drive`,
      });
      setSelectedKeys(new Set());
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const destroy = async (list: TrashItem[]) => {
    setBusy(true);
    try {
      const result = await deleteItemsForever(refsOf(list));
      if (!result.success) {
        showToast({ message: "Couldn't delete" });
        return;
      }
      showToast({
        ...describe(list),
        message:
          list.length === 1
            ? "deleted forever"
            : `${plural(result.data.count)} deleted forever`,
      });
      setSelectedKeys(new Set());
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const emptyAll = async () => {
    setBusy(true);
    try {
      const result = await emptyTrashAction();
      showToast({
        message: result.success ? "Trash emptied" : "Couldn't empty the trash",
      });
      setSelectedKeys(new Set());
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-br from-gray-950 via-gray-900 to-gray-800 p-4 font-sans text-gray-100 md:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4">
        <DriveHeader
          parents={[]}
          rootFolderId={rootFolderId}
          trashCount={items.length}
          section="trash"
        />

        {/* Toolbar */}
        <div className="flex items-center gap-3 rounded-xl bg-gray-800/50 p-3 px-6 shadow-xl ring-1 ring-gray-700/50 backdrop-blur-md">
          <Checkbox
            checked={allSelected}
            disabled={items.length === 0}
            onCheckedChange={(checked) =>
              setSelectedKeys(
                checked === true ? new Set(items.map(keyOf)) : new Set(),
              )
            }
            aria-label="Select all"
          />
          <p className="flex min-w-0 items-center gap-2 text-sm text-gray-400">
            <Clock size={15} className="shrink-0" />
            <span className="truncate">
              {someSelected
                ? `${plural(selected.length)} selected`
                : `Items are deleted forever after ${TRASH_RETENTION_DAYS} days`}
            </span>
          </p>

          <div className="flex-1" />

          <ToolbarButton
            label="Restore"
            icon={<RotateCcw size={16} />}
            disabled={!someSelected || busy}
            onClick={() => void restore(selected)}
          />
          <ConfirmDialog
            trigger={
              <ToolbarButton
                label="Delete forever"
                icon={<X size={16} />}
                tone="danger"
                disabled={!someSelected || busy}
              />
            }
            title={`Delete ${plural(selected.length)} forever?`}
            description="They'll be removed permanently, along with everything inside any folders. This can't be undone."
            actionLabel="Delete forever"
            onAction={() => destroy(selected)}
          />

          <div className="mx-1 h-5 w-px bg-gray-700/80 max-sm:hidden" />

          <ConfirmDialog
            trigger={
              <ToolbarButton
                label="Empty trash"
                icon={<Trash2 size={16} />}
                tone="danger"
                disabled={items.length === 0 || busy}
              />
            }
            title="Empty trash?"
            description={`All ${plural(items.length)} in the trash will be deleted forever. This can't be undone.`}
            actionLabel="Empty trash"
            onAction={emptyAll}
          />
        </div>

        {items.length === 0 ? (
          <EmptyTrash rootFolderId={rootFolderId} />
        ) : (
          <div className="overflow-hidden rounded-xl bg-gray-800/50 shadow-xl ring-1 ring-gray-700/50 backdrop-blur-md">
            <div className="border-b border-gray-700/50 bg-gray-800/30 px-6 py-4">
              <div className="grid grid-cols-12 items-center gap-4 text-xs font-medium text-gray-400 md:text-sm">
                <div className="col-span-7 flex items-center gap-4 md:col-span-5">
                  <div className="w-4 shrink-0" />
                  <span>Name</span>
                </div>
                <div className="max-md:hidden md:col-span-2">Deleted</div>
                <div className="max-md:hidden md:col-span-2">Size</div>
                <div className="col-span-3 md:col-span-2">Removed in</div>
                <div className="col-span-2 flex justify-end md:col-span-1">
                  Actions
                </div>
              </div>
            </div>

            <ul>
              {items.map((item) => (
                <TrashRow
                  key={keyOf(item)}
                  item={item}
                  isSelected={selectedKeys.has(keyOf(item))}
                  busy={busy}
                  onToggle={() => toggle(item)}
                  onRestore={() => void restore([item])}
                  onDelete={() => destroy([item])}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function TrashRow({
  item,
  isSelected,
  busy,
  onToggle,
  onRestore,
  onDelete,
}: {
  item: TrashItem;
  isSelected: boolean;
  busy: boolean;
  onToggle: () => void;
  onRestore: () => void;
  onDelete: () => Promise<void>;
}) {
  const urgent = item.daysLeft <= 2;

  return (
    <li
      onClick={onToggle}
      className={`cursor-pointer border-b border-gray-700/50 px-6 py-3.5 transition-colors last:border-b-0 hover:bg-gray-700/40 ${
        isSelected ? "bg-gray-800/80" : ""
      }`}
    >
      <div className="grid grid-cols-12 items-center gap-4">
        <div className="col-span-7 flex min-w-0 items-center gap-4 md:col-span-5">
          <div className="flex shrink-0" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={isSelected}
              onCheckedChange={onToggle}
              aria-label={`Select ${item.name}`}
            />
          </div>
          <FileIcon
            type={item.type}
            name={item.name}
            size={20}
            className="shrink-0"
          />
          <div className="min-w-0">
            <p className="truncate text-sm text-gray-100" title={item.name}>
              {item.name}
            </p>
            <p className="truncate text-xs text-gray-500">
              from {item.originName}
            </p>
          </div>
        </div>

        <div className="text-sm text-gray-400 max-md:hidden md:col-span-2">
          {formatDate(item.deletedAt)}
        </div>

        <div className="text-sm text-gray-400 max-md:hidden md:col-span-2">
          {formatSize(item.size)}
          {item.itemCount !== null && (
            <span className="block text-xs text-gray-500">
              {plural(item.itemCount)}
            </span>
          )}
        </div>

        <div
          className={`col-span-3 text-sm md:col-span-2 ${
            urgent ? "text-amber-400" : "text-gray-400"
          }`}
        >
          {item.daysLeft === 0
            ? "Today"
            : item.daysLeft === 1
              ? "1 day"
              : `${item.daysLeft} days`}
        </div>

        <div
          className="col-span-2 flex justify-end gap-1 md:col-span-1"
          onClick={(e) => e.stopPropagation()}
        >
          <RowButton
            label={`Restore ${item.name}`}
            disabled={busy}
            onClick={onRestore}
          >
            <RotateCcw size={15} />
          </RowButton>
          <ConfirmDialog
            trigger={
              <RowButton
                label={`Delete ${item.name} forever`}
                tone="danger"
                disabled={busy}
              >
                <X size={15} />
              </RowButton>
            }
            title={
              item.type === "folder"
                ? "Delete folder forever?"
                : "Delete file forever?"
            }
            description={
              item.type === "folder"
                ? `“${item.name}” and everything inside it will be removed permanently. This can't be undone.`
                : `“${item.name}” will be removed permanently. This can't be undone.`
            }
            actionLabel="Delete forever"
            onAction={onDelete}
          />
        </div>
      </div>
    </li>
  );
}

function ToolbarButton({
  label,
  icon,
  tone = "neutral",
  disabled,
  ...rest
}: {
  label: string;
  icon: React.ReactNode;
  tone?: "neutral" | "danger";
  disabled?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const enabled =
    tone === "danger"
      ? "cursor-pointer bg-red-900/40 text-red-400 hover:bg-red-900/70 hover:text-red-300"
      : "cursor-pointer bg-gray-700/60 text-gray-200 hover:bg-gray-700 hover:text-white";

  return (
    <button
      {...rest}
      type="button"
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-8 shrink-0 items-center gap-2 rounded-lg px-2.5 text-sm font-medium transition-colors sm:px-3 ${
        disabled ? "bg-gray-800 text-gray-600 opacity-60" : enabled
      }`}
    >
      {icon}
      <span className="max-sm:hidden">{label}</span>
    </button>
  );
}

function RowButton({
  label,
  tone = "neutral",
  disabled,
  children,
  ...rest
}: {
  label: string;
  tone?: "neutral" | "danger";
  disabled?: boolean;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      type="button"
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors disabled:cursor-default disabled:opacity-40 ${
        tone === "danger"
          ? "text-gray-400 hover:bg-red-900/40 hover:text-red-300"
          : "text-gray-400 hover:bg-gray-700/70 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyTrash({ rootFolderId }: { rootFolderId: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-xl bg-gray-800/30 px-6 py-20 text-center ring-1 ring-gray-700/50">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-800/80 ring-1 ring-gray-700/60">
        <Trash2 size={28} className="text-gray-500" />
      </div>
      <h2 className="text-lg font-semibold text-gray-200">Trash is empty</h2>
      <p className="mt-2 max-w-sm text-sm text-gray-400">
        Deleted files and folders stay here for {TRASH_RETENTION_DAYS} days,
        then they&apos;re gone for good.
      </p>
      <Link
        href={`/f/${rootFolderId}`}
        className="mt-6 rounded-lg bg-gray-700/60 px-4 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-gray-700 hover:text-white"
      >
        Back to My Drive
      </Link>
    </div>
  );
}
