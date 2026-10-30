import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Liem Luttrell — software and engineering. Flowcast, NoteBrew, and Liemfish.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const font = await readFile(join(process.cwd(), "app/fonts/terminess-regular.ttf"));
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", padding: 42, background: "#8b6e44", fontFamily: "Terminess", color: "#f1e6d2" }}>
      <div style={{ display: "flex", flexDirection: "column", width: "100%", border: "2px solid #b79170", borderRadius: 12, background: "#2b2428", padding: "28px 42px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#cdb9a7", borderBottom: "1px solid #665448", paddingBottom: 24 }}><span>liem@portfolio: ~</span><span>epicliem.com</span></div>
        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "center" }}>
          <div style={{ display: "flex", fontSize: 82 }}>Liem Luttrell</div>
          <div style={{ display: "flex", fontSize: 40, marginTop: 12, color: "#efb47f" }}>Software &amp; engineering</div>
          <div style={{ display: "flex", fontSize: 28, marginTop: 20 }}>Boston University · Class of 2030</div>
        </div>
        <div style={{ display: "flex", fontSize: 28, borderTop: "1px solid #665448", paddingTop: 24 }}>Flowcast · NoteBrew · Liemfish</div>
      </div>
    </div>,
    { ...size, fonts: [{ name: "Terminess", data: font, weight: 400, style: "normal" }] },
  );
}
