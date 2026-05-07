import * as jpeg from 'jpeg-js';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';

export interface ThermalizeOptions {
  /** Effective column/row block size for sampling (≈2–24). */
  pixelSize: number;
  /** Luminosity curve around mid-gray (≈0.5–2). */
  contrast: number;
  /** Floyd–Steinberg strength on downsampled grid (0 = threshold only). */
  intensity: number;
}

/** RGBA thermal / bitmap — downsample, contrast, optional error diffusion on grid. */
export function thermalizeRgba(
  src: Uint8Array | Uint8ClampedArray,
  width: number,
  height: number,
  opts: ThermalizeOptions
): Uint8Array {
  const { pixelSize, contrast, intensity } = opts;
  const data = src instanceof Uint8Array ? src : new Uint8Array(src);
  const out = new Uint8Array(width * height * 4);
  const bw = Math.max(2, Math.floor(width / Math.max(1, pixelSize)));
  const bh = Math.max(2, Math.floor(height / Math.max(1, pixelSize)));
  const grid = new Float32Array(bw * bh);

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
          const r = data[i] ?? 0;
          const g = data[i + 1] ?? 0;
          const b = data[i + 2] ?? 0;
          sum += 0.299 * r + 0.587 * g + 0.114 * b;
          count++;
        }
      }
      let gray = count ? sum / count : 0;
      gray = (gray - 128) * contrast + 128;
      grid[gy * bw + gx] = Math.max(0, Math.min(255, gray));
    }
  }

  const dithered =
    intensity > 0.04 ? floydSteinbergGrid(grid, bw, bh, intensity) : quantizeGrid(grid, bw, bh);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const gx = Math.min(bw - 1, Math.floor((x / width) * bw));
      const gy = Math.min(bh - 1, Math.floor((y / height) * bh));
      const raw = dithered[gy * bw + gx] ?? 0;
      const v = raw > 127 ? 248 : 28;
      const i = (y * width + x) * 4;
      out[i] = v;
      out[i + 1] = v;
      out[i + 2] = v;
      out[i + 3] = 255;
    }
  }
  return out;
}

function quantizeGrid(g: Float32Array, w: number, h: number): Float32Array {
  const o = new Float32Array(g.length);
  for (let i = 0; i < g.length; i++) {
    const v = g[i] ?? 0;
    o[i] = v >= 128 ? 255 : 0;
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
    const sub = bytes.subarray(i, i + chunk);
    bin += String.fromCharCode.apply(null, sub as unknown as number[]);
  }
  return btoa(bin);
}

function encodeBytesFromJpegEncode(result: unknown): Uint8Array {
  if (result instanceof Uint8Array) return result;
  if (
    result &&
    typeof result === 'object' &&
    'data' in result &&
    (result as { data: unknown }).data instanceof Uint8Array
  ) {
    return (result as { data: Uint8Array }).data;
  }
  const buf = result as { buffer?: ArrayBuffer; byteOffset?: number; byteLength?: number };
  if (buf?.buffer && typeof buf.byteLength === 'number') {
    return new Uint8Array(buf.buffer, buf.byteOffset ?? 0, buf.byteLength);
  }
  throw new Error('jpeg encode: unexpected output');
}

export async function processThermalImage(sourceUri: string, opts: ThermalizeOptions): Promise<string> {
  const resizeW = Math.max(
    64,
    Math.min(480, Math.round(360 / Math.max(1, opts.pixelSize / 4)))
  );
  const result = await ImageManipulator.manipulateAsync(
    sourceUri,
    [{ resize: { width: resizeW } }],
    { compress: 0.88, format: ImageManipulator.SaveFormat.JPEG, base64: true }
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
  const filename = `thermal-${Date.now()}.jpg`;
  const outPath = `${dir}${filename}`;
  const b64 = uint8ToBase64(encBytes);
  await FileSystem.writeAsStringAsync(outPath, b64, {
    encoding: 'base64',
  });
  return outPath;
}
