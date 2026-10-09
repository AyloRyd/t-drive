/** The grid + emerald glow shared by every public-facing page. */
export function GridBackground({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-gray-950 text-gray-100">
      {/* Grid on its own layer so a radial mask can fade it out toward the
          corners instead of ruling the whole viewport evenly. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.055) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.055) 1px, transparent 1px)
          `,
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 75% 55% at 50% 32%, #000 0%, rgba(0,0,0,0.35) 55%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 75% 55% at 50% 32%, #000 0%, rgba(0,0,0,0.35) 55%, transparent 80%)",
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.07), transparent 55%)",
        }}
      />

      {/* min-h here too: pages that centre their content rely on it. */}
      <div className={`relative min-h-[100dvh] ${className}`}>{children}</div>
    </div>
  );
}
