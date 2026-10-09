import Image from "next/image";
import Link from "next/link";

export function BrandMark({ size = 24 }: { size?: number }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
    >
      <Image
        src="/logo.png"
        alt=""
        width={size}
        height={size}
        className="opacity-90"
      />
      <span className="text-lg font-bold tracking-tight text-white">
        t-drive
      </span>
    </Link>
  );
}
