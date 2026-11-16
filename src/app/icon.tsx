import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  const emblem = await readFile(
    join(process.cwd(), "public/brand/Siddiona-emblem-icon-white.png")
  );

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0B1020",
        borderRadius: 12,
      }}
    >
      {/* The official emblem is kept unchanged; the dark tile makes its white ST legible. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`data:image/png;base64,${emblem.toString("base64")}`}
        alt=""
        width={58}
        height={60}
      />
    </div>,
    size
  );
}
