import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

const BACKGROUND = join(process.cwd(), "assets/og/background.png");

export async function renderOgImage({
  eyebrow,
  title,
  footer,
}: {
  eyebrow: string;
  title: string;
  footer: string;
}) {
  const serif = await readFile(join(process.cwd(), "assets/fonts/InstrumentSerif-Regular.ttf"));
  const background = existsSync(BACKGROUND)
    ? `data:image/png;base64,${(await readFile(BACKGROUND)).toString("base64")}`
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#fbfbf8",
          color: "#111214",
          position: "relative",
        }}
      >
        {background && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={background}
            alt=""
            width={1200}
            height={630}
            style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, objectFit: "cover" }}
          />
        )}
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 2, textTransform: "uppercase", color: "#1d4ed8" }}>
          {eyebrow}
        </div>
        <div style={{ display: "flex", fontFamily: "Instrument Serif", fontSize: 76, lineHeight: 1.05, maxWidth: 980 }}>
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#52525b" }}>{footer}</div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [{ name: "Instrument Serif", data: serif, style: "normal", weight: 400 }],
    },
  );
}
