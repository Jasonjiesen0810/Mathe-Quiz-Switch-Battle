import * as THREE from "three";
import type { Product } from "@/lib/products";

// Paints the wrap-around jar label onto a canvas. The label covers 0.85 of the
// jar's circumference, so the centre of the canvas faces the camera.
export function paintLabel(canvas: HTMLCanvasElement, p: Product, displayFont: string, bodyFont: string) {
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext("2d")!;
  const accent = p.id === "black-garlic-crisp" ? "#FF8A3D" : p.sauce === "#E8430A" ? "#FF5A1F" : p.sauce;

  // Paper: near-black stock with fibre noise
  ctx.fillStyle = "#0E0B0A";
  ctx.fillRect(0, 0, W, H);
  const img = ctx.getImageData(0, 0, W, H);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 14;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);

  const cx = W / 2;

  // Borders
  ctx.strokeStyle = accent;
  ctx.lineWidth = 6;
  ctx.strokeRect(14, 14, W - 28, H - 28);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(30, 30, W - 60, H - 60);

  // Brand
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#F4EEE6";
  ctx.font = `900 132px ${displayFont}`;
  ctx.fillText("EMBER & ASH", cx, 200);

  // Rule with number
  ctx.fillStyle = accent;
  ctx.fillRect(cx - 320, 236, 220, 4);
  ctx.fillRect(cx + 100, 236, 220, 4);
  ctx.font = `900 54px ${displayFont}`;
  ctx.fillText(`No.${p.no}`, cx, 256);

  // Flavour name
  ctx.fillStyle = accent;
  ctx.font = `800 76px ${displayFont}`;
  ctx.fillText(p.name.toUpperCase(), cx, 352);

  // Fine print
  ctx.fillStyle = "rgba(244,238,230,.65)";
  ctx.font = `500 24px ${bodyFont}`;
  ctx.fillText(`SMALL BATCH  ·  FERMENTED 90 DAYS  ·  ${p.size.toUpperCase()}`, cx, 408);

  // Heat pips
  const pipW = 26;
  const gap = 10;
  const total = 10 * pipW + 9 * gap;
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = i < p.heat ? accent : "rgba(244,238,230,.15)";
    ctx.fillRect(cx - total / 2 + i * (pipW + gap), 430, pipW, 10);
  }

  // Side panels (seen as the jar turns)
  ctx.save();
  ctx.fillStyle = "rgba(244,238,230,.7)";
  ctx.textAlign = "left";
  ctx.font = `600 22px ${bodyFont}`;
  const left = ["INGREDIENTS", ...p.notes.map((n) => n.toUpperCase()), "SEA SALT, BRINE"];
  left.forEach((t, i) => {
    ctx.fillStyle = i === 0 ? accent : "rgba(244,238,230,.6)";
    ctx.fillText(t, 110, 120 + i * 44);
  });
  ctx.textAlign = "right";
  const right = ["HEAT", `${p.shu.toLocaleString("en-US")} SHU`, "BATCH 0417", "BROOKLYN, NY"];
  right.forEach((t, i) => {
    ctx.fillStyle = i === 0 ? accent : "rgba(244,238,230,.6)";
    ctx.fillText(t, W - 110, 120 + i * 44);
  });
  ctx.restore();

  return canvas;
}

export function makeLabelTexture() {
  // Size is fixed up front: a GPU texture can't change size after its first upload.
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 480;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return { canvas, tex };
}
