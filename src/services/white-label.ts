import type { WhiteLabelConfig } from "@/types/database"

export const DEFAULT_WHITE_LABEL: WhiteLabelConfig = {
  logoUrl: null,
  primaryColor: "#FF6B00",
  fontFamily: "Inter, system-ui, sans-serif",
  reportHeader: "SEO Performance Report",
  reportFooter: "Powered by H-VAC-celerator",
}

export function buildCSSVariables(config: WhiteLabelConfig): Record<string, string> {
  return {
    "--wl-primary": config.primaryColor,
    "--wl-primary-foreground": getContrastColor(config.primaryColor),
    "--wl-font-family": config.fontFamily,
  }
}

function getContrastColor(hex: string): string {
  const c = hex.replace("#", "")
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? "#000000" : "#FFFFFF"
}
