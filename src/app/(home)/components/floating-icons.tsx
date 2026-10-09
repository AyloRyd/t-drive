import { Code, FileText, Film, Folder, Image as ImageIcon, Music } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type FloatingIcon = {
  icon: LucideIcon;
  /** Glyph colour. */
  tint: string;
  /** Tailwind position utilities. */
  at: string;
  /** Tile size in px. */
  size: number;
  rotate: number;
  /** Seconds for one drift cycle. */
  speed: number;
  /** Dropped on small screens to keep the hero uncluttered. */
  desktopOnly?: boolean;
};

/**
 * Six tiles, mirrored left and right: the mid-height pair is largest and
 * sits furthest out, the top pair smallest and tucked inward. All of them
 * stay clear of the viewport edges so the group reads as one cluster.
 */
const ICONS: FloatingIcon[] = [
  // Top pair — small, closer to the headline.
  { icon: Code, tint: "#c084fc", at: "top-[7%] left-[28%]", size: 60, rotate: -10, speed: 9, desktopOnly: true },
  { icon: FileText, tint: "#cbd5e1", at: "top-[6%] left-[64%]", size: 56, rotate: 11, speed: 10.5, desktopOnly: true },

  // Middle pair — largest, pushed out toward the edges.
  { icon: Folder, tint: "#eab308", at: "top-[30%] left-[9%]", size: 102, rotate: -9, speed: 8 },
  { icon: ImageIcon, tint: "#60a5fa", at: "top-[29%] left-[79%]", size: 98, rotate: 8, speed: 11 },

  // Lower pair — medium, drawn back in a little.
  { icon: Music, tint: "#2dd4bf", at: "top-[66%] left-[16%]", size: 74, rotate: 7, speed: 9.5 },
  { icon: Film, tint: "#f472b6", at: "top-[64%] left-[72%]", size: 78, rotate: -6, speed: 8.5 },
];

export function FloatingIcons() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      {ICONS.map(({ icon: Icon, tint, at, size, rotate, speed, desktopOnly }, i) => (
        <div
          key={i}
          // rotate and the float's translate are separate CSS properties, so
          // the animation no longer wipes out the angle. max-md:hidden rather
          // than `hidden md:block`, which loses the cascade to plain `hidden`.
          className={`drive-float absolute ${at} ${desktopOnly ? "max-md:hidden" : ""}`}
          style={
            {
              rotate: `${rotate}deg`,
              "--float-duration": `${speed}s`,
            } as React.CSSProperties
          }
        >
          <div
            className="flex items-center justify-center rounded-[26%] ring-1 ring-white/15"
            style={{
              width: size,
              height: size,
              // Lit top edge and dark bottom so the rim reads as a bevel.
              background:
                "linear-gradient(to bottom right, #161b23 0%, #0a0d12 100%)",
              boxShadow:
                "0 20px 42px -14px rgba(0,0,0,0.95), inset 0 1px 0 0 rgba(255,255,255,0.14), inset 0 -1px 0 0 rgba(0,0,0,0.6)",
            }}
          >
            <Icon
              style={{ color: tint, width: size * 0.44, height: size * 0.44 }}
              strokeWidth={2}
              absoluteStrokeWidth
            />
          </div>
        </div>
      ))}
    </div>
  );
}
