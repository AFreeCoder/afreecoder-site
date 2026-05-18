import { ImageResponse } from "next/og";

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
          background: "#fbfaf7",
          padding: "80px",
          fontFamily: "monospace",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, color: "#1c1917" }}>
          AFreeCoder
        </div>
        <div style={{ marginTop: 24, color: "#c2410c", fontSize: 30 }}>
          {"// A-Free-Coder · Freedom Trace"}
        </div>
        <div style={{ marginTop: 24, color: "#625a55", fontSize: 24 }}>
          追求自由的 Coder / AI / 独立产品 / 写作
        </div>
      </div>
    ),
    size,
  );
}
