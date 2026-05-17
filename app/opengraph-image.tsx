import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "AFreeCoder";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          background: "#0a0a0a",
          padding: "80px",
          fontFamily: "monospace",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, color: "#fff" }}>
          AFreeCoder
        </div>
        <div style={{ marginTop: 24, color: "#fb923c", fontSize: 28 }}>
          // Observing · Building · Iterating
        </div>
        <div style={{ marginTop: 24, color: "#888", fontSize: 22 }}>
          Independent Developer · AI · 投资理财
        </div>
      </div>
    ),
    size,
  );
}
