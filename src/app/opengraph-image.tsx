import { ImageResponse } from "next/og";
import { siteName } from "~/lib/site";

export const runtime = "nodejs";
export const alt = "t-drive — your files, without the clutter";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 90px",
          background:
            "radial-gradient(900px 500px at 50% 0%, #0c2a22 0%, #030712 60%)",
          color: "#f9fafb",
          fontFamily: "sans-serif",
        }}
      >
        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 800,
              color: "#03140f",
            }}
          >
            t
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>
            {siteName}
          </div>
        </div>

        <div
          style={{
            marginTop: 40,
            fontSize: 82,
            fontWeight: 800,
            lineHeight: 1.03,
            letterSpacing: -2.5,
            maxWidth: 940,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>Your files,</span>
          <span style={{ color: "#9ca3af" }}>without the clutter.</span>
        </div>

        <div
          style={{
            marginTop: 32,
            fontSize: 28,
            color: "#9ca3af",
            maxWidth: 860,
            lineHeight: 1.4,
          }}
        >
          Upload whole folders. Preview images, PDFs, code and media in the
          browser. Open source.
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 8,
            background: "linear-gradient(90deg, #10b981 0%, #0d9488 100%)",
          }}
        />
      </div>
    ),
    size,
  );
}
