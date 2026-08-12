export interface HslColor {
  h: number;
  s: number;
  l: number;
}

export function hexToHsl(hex: string): HslColor | null {
  const sanitized = hex.replace("#", "");
  if (![3, 6].includes(sanitized.length)) return null;

  const full =
    sanitized.length === 3
      ? sanitized
          .split("")
          .map((c) => c + c)
          .join("")
      : sanitized;

  const r = parseInt(full.substring(0, 2), 16) / 255;
  const g = parseInt(full.substring(2, 4), 16) / 255;
  const b = parseInt(full.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslString({ h, s, l }: HslColor): string {
  return `${h} ${s}% ${l}%`;
}

export function getContrastForeground({ l }: HslColor): string {
  return l < 55 ? "0 0% 100%" : "220 30% 6%";
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function adjustLightness(color: HslColor, delta: number): HslColor {
  return { ...color, l: clamp(color.l + delta, 5, 95) };
}

export function adjustSaturation(color: HslColor, delta: number): HslColor {
  return { ...color, s: clamp(color.s + delta, 0, 100) };
}

export function colorVarsFromHex(hex?: string | null, prefix = "--pitch"): Record<string, string> {
  const hsl = hex ? hexToHsl(hex) : null;
  if (!hsl) return {};

  const primary = hsl;
  const light = adjustLightness(adjustSaturation(primary, 5), 10);
  const dark = adjustLightness(primary, -10);

  const contrast = getContrastForeground(primary);

  return {
    [`${prefix}-500`]: hslString(primary),
    [`${prefix}-400`]: hslString(light),
    [`${prefix}-600`]: hslString(dark),
    [`${prefix}-foreground`]: contrast,
  };
}

export function brandCssVariables({
  colorPrimario,
  colorSecundario,
}: {
  colorPrimario?: string | null;
  colorSecundario?: string | null;
}): React.CSSProperties {
  const primary = colorVarsFromHex(colorPrimario, "--pitch");
  const secondary = colorVarsFromHex(colorSecundario, "--gold");

  return {
    ...Object.fromEntries(Object.entries(primary).map(([k, v]) => [k, v])),
    ...Object.fromEntries(Object.entries(secondary).map(([k, v]) => [k, v])),
    "--primary": primary["--pitch-500"] || "149 80% 37%",
    "--primary-foreground": primary["--pitch-foreground"] || "0 0% 100%",
    "--accent": secondary["--gold-400"] || "38 88% 59%",
    "--accent-foreground": secondary["--gold-foreground"] || "220 30% 6%",
  } as React.CSSProperties;
}
