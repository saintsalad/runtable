import { Buffer as BufferPolyfill } from 'buffer';
if (typeof global.Buffer === 'undefined') {
  (global as typeof globalThis & { Buffer: typeof BufferPolyfill }).Buffer = BufferPolyfill;
}

import * as jpeg from 'jpeg-js';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';

export type PixelShape = 'square' | 'circle-solid' | 'circle-outline';
export type ColorMode = 'duotone' | 'tritone';

export interface ThermalizeOptions {
  pixelSize: number;
  contrast: number;
  intensity: number;
  pixelShape?: PixelShape;
  /** Foreground (dark) color [r,g,b]. */
  fgColor?: [number, number, number];
  /** Background (light) color [r,g,b]. */
  bgColor?: [number, number, number];
  /** Mid-tone color [r,g,b] — only used when colorMode is 'tritone'. */
  midColor?: [number, number, number];
  colorMode?: ColorMode;
}

/** Returns true if pixel at (lx, ly) within a cell of size (cw, ch) is inside the pixel shape. */
function inPixelShape(
  lx: number,
  ly: number,
  cw: number,
  ch: number,
  shape: PixelShape,
): boolean {
  if (shape === 'square') return true;
  // normalised distance from cell centre
  const cx = (cw - 1) / 2;
  const cy = (ch - 1) / 2;
  const dx = (lx - cx) / (cx + 0.5);
  const dy = (ly - cy) / (cy + 0.5);
  const d2 = dx * dx + dy * dy;
  if (shape === 'circle-solid') return d2 <= 1;
  // circle-outline: ring between 60% and 100% of radius
  return d2 <= 1 && d2 >= 0.36;
}

/** Map a 0-255 gray value to an RGB color based on color mode. */
function grayToColor(
  raw: number,
  fg: [number, number, number],
  bg: [number, number, number],
  mid: [number, number, number] | undefined,
  colorMode: ColorMode,
): [number, number, number] {
  if (colorMode === 'tritone' && mid) {
    if (raw < 85) return fg;
    if (raw < 170) return mid;
    return bg;
  }
  // duotone — dithered grid is already 0 or 255
  return raw <= 127 ? fg : bg;
}

export function thermalizeRgba(
  src: Uint8Array | Uint8ClampedArray,
  width: number,
  height: number,
  opts: ThermalizeOptions,
): Uint8Array {
  const { pixelSize, contrast, intensity } = opts;
  const fg = opts.fgColor ?? [28, 28, 28];
  const bg = opts.bgColor ?? [248, 248, 248];
  const mid = opts.midColor;
  const colorMode = opts.colorMode ?? 'duotone';
  const pixelShape = opts.pixelShape ?? 'square';

  const data = src instanceof Uint8Array ? src : new Uint8Array(src);
  const out = new Uint8Array(width * height * 4);

  const bw = Math.max(2, Math.floor(width / Math.max(1, pixelSize)));
  const bh = Math.max(2, Math.floor(height / Math.max(1, pixelSize)));
  const grid = new Float32Array(bw * bh);

  // downsample to grid
  for (let gy = 0; gy < bh; gy++) {
    for (let gx = 0; gx < bw; gx++) {
      const x0 = Math.floor((gx * width) / bw);
      const x1 = Math.floor(((gx + 1) * width) / bw);
      const y0 = Math.floor((gy * height) / bh);
      const y1 = Math.floor(((gy + 1) * height) / bh);
      let sum = 0;
      let count = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * width + x) * 4;
          sum += 0.299 * (data[i] ?? 0) + 0.587 * (data[i + 1] ?? 0) + 0.114 * (data[i + 2] ?? 0);
          count++;
        }
      }
      let gray = count ? sum / count : 0;
      gray = (gray - 128) * contrast + 128;
      grid[gy * bw + gx] = Math.max(0, Math.min(255, gray));
    }
  }

  // for tritone skip binary dithering — keep continuous gray values
  const processed =
    colorMode === 'tritone'
      ? grid
      : intensity > 0.04
      ? floydSteinbergGrid(grid, bw, bh, intensity)
      : quantizeGrid(grid, bw, bh);

  // paint back to full resolution with per-cell pixel shape mask
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const gx = Math.min(bw - 1, Math.floor((x / width) * bw));
      const gy = Math.min(bh - 1, Math.floor((y / height) * bh));

      // local position within the cell
      const x0 = Math.floor((gx * width) / bw);
      const x1 = Math.floor(((gx + 1) * width) / bw);
      const y0 = Math.floor((gy * height) / bh);
      const y1 = Math.floor(((gy + 1) * height) / bh);
      const cw = Math.max(1, x1 - x0);
      const ch = Math.max(1, y1 - y0);
      const lx = x - x0;
      const ly = y - y0;

      const raw = processed[gy * bw + gx] ?? 0;
      const i = (y * width + x) * 4;

      const inside = inPixelShape(lx, ly, cw, ch, pixelShape);

      let color: [number, number, number];
      if (inside) {
        color = grayToColor(raw, fg, bg, mid, colorMode);
      } else {
        // outside pixel shape — use background color
        color = bg;
      }

      out[i] = color[0];
      out[i + 1] = color[1];
      out[i + 2] = color[2];
      out[i + 3] = 255;
    }
  }
  return out;
}

function quantizeGrid(g: Float32Array, w: number, h: number): Float32Array {
  const o = new Float32Array(g.length);
  for (let i = 0; i < g.length; i++) {
    o[i] = (g[i] ?? 0) >= 128 ? 255 : 0;
  }
  return o;
}

function floydSteinbergGrid(g: Float32Array, w: number, h: number, strength: number): Float32Array {
  const out = Float32Array.from(g);
  const s = Math.max(0, Math.min(1, strength));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const old = out[i] ?? 0;
      const quantized = old >= 128 ? 255 : 0;
      const err = (old - quantized) * s;
      out[i] = quantized;
      if (x + 1 < w) out[i + 1] += (err * 7) / 16;
      if (y + 1 < h) {
        if (x > 0) out[i + w - 1] += (err * 3) / 16;
        out[i + w] += (err * 5) / 16;
        if (x + 1 < w) out[i + w + 1] += (err * 1) / 16;
      }
    }
  }
  return out;
}

function uint8ToBase64(bytes: Uint8Array): string {
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk) as unknown as number[]);
  }
  return btoa(bin);
}

function encodeBytesFromJpegEncode(result: unknown): Uint8Array {
  if (result instanceof Uint8Array) return result;
  if (result && typeof result === 'object' && 'data' in result) {
    const d = (result as { data: unknown }).data;
    if (d instanceof Uint8Array) return d;
  }
  const buf = result as { buffer?: ArrayBuffer; byteOffset?: number; byteLength?: number };
  if (buf?.buffer && typeof buf.byteLength === 'number') {
    return new Uint8Array(buf.buffer, buf.byteOffset ?? 0, buf.byteLength);
  }
  throw new Error('jpeg encode: unexpected output');
}

export async function processThermalImage(sourceUri: string, opts: ThermalizeOptions): Promise<string> {
  const resizeW = Math.max(64, Math.min(480, Math.round(360 / Math.max(1, opts.pixelSize / 4))));
  const result = await ImageManipulator.manipulateAsync(
    sourceUri,
    [{ resize: { width: resizeW } }],
    { compress: 0.88, format: ImageManipulator.SaveFormat.JPEG, base64: true },
  );
  if (!result.base64) throw new Error('Image manipulator did not return base64');

  const binaryString = atob(result.base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);

  const decoded = jpeg.decode(bytes, { useTArray: true, formatAsRGBA: true });
  const { width, height, data } = decoded;
  if (!data || !width || !height) throw new Error('JPEG decode failed');

  const rgba = data instanceof Uint8Array ? data : new Uint8Array(data);
  const thermal = thermalizeRgba(rgba, width, height, opts);

  const encBytes = encodeBytesFromJpegEncode(jpeg.encode({ data: thermal, width, height }, 90));

  const dir = FileSystem.cacheDirectory;
  if (!dir) throw new Error('No cache directory');
  const outPath = `${dir}thermal-${Date.now()}.jpg`;
  await FileSystem.writeAsStringAsync(outPath, uint8ToBase64(encBytes), { encoding: 'base64' });
  return outPath;
}
