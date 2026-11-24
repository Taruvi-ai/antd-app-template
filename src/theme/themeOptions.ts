import type { ThemeConfig } from "antd";

/**
 * Design tokens for this app. Brand-neutral by default (plain antd look).
 * Define a local `DESIGN.md` and update these values to brand the app —
 * never hardcode brand hex values in pages/components, import from here.
 */
export const taruviTokens = {
  colorPrimary: "#1677ff",
  borderRadius: 6,
  fontFamily: "'Open Sans', sans-serif",
} as const;

/** Shared antd theme config. `algorithm` is added by the color-mode context. */
export const baseThemeConfig: ThemeConfig = {
  token: { ...taruviTokens },
};
