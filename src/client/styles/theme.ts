import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        // Primary palette - Deep Navy (trust, professionalism)
        navy: {
          50: { value: "#f0f4f8" },
          100: { value: "#d9e2ec" },
          200: { value: "#bcccdc" },
          300: { value: "#9fb3c8" },
          400: { value: "#829ab1" },
          500: { value: "#627d98" },
          600: { value: "#486581" },
          700: { value: "#334e68" },
          800: { value: "#243b53" },
          900: { value: "#102a43" },
        },
        // Accent palette - Warm Amber (wealth, success, warmth)
        amber: {
          50: { value: "#fffbeb" },
          100: { value: "#fef3c7" },
          200: { value: "#fde68a" },
          300: { value: "#fcd34d" },
          400: { value: "#fbbf24" },
          500: { value: "#f59e0b" },
          600: { value: "#d97706" },
          700: { value: "#b45309" },
          800: { value: "#92400e" },
          900: { value: "#78350f" },
        },
        // Success - Green (South African Rand inspired)
        success: {
          50: { value: "#ecfdf5" },
          100: { value: "#d1fae5" },
          200: { value: "#a7f3d0" },
          300: { value: "#6ee7b7" },
          400: { value: "#34d399" },
          500: { value: "#10b981" },
          600: { value: "#059669" },
          700: { value: "#047857" },
          800: { value: "#065f46" },
          900: { value: "#064e3b" },
        },
        // Error - Red
        error: {
          50: { value: "#fef2f2" },
          100: { value: "#fee2e2" },
          200: { value: "#fecaca" },
          300: { value: "#fca5a5" },
          400: { value: "#f87171" },
          500: { value: "#ef4444" },
          600: { value: "#dc2626" },
          700: { value: "#b91c1c" },
          800: { value: "#991b1b" },
          900: { value: "#7f1d1d" },
        },
        // South African Theme Colors
        safari: {
          50: { value: "#fff7ed" },
          100: { value: "#ffedd5" },
          200: { value: "#fed7aa" },
          300: { value: "#fdba74" },
          400: { value: "#fb923c" },
          500: { value: "#f97316" },
          600: { value: "#ea580c" },
          700: { value: "#c2410c" },
          800: { value: "#9a3412" },
          900: { value: "#7c2d12" },
        },
        ocean: {
          50: { value: "#f0f9ff" },
          100: { value: "#e0f2fe" },
          200: { value: "#bae6fd" },
          300: { value: "#7dd3fc" },
          400: { value: "#38bdf8" },
          500: { value: "#0ea5e9" },
          600: { value: "#0284c7" },
          700: { value: "#0369a1" },
          800: { value: "#075985" },
          900: { value: "#0c4a6e" },
        },
        savanna: {
          50: { value: "#f0fdf4" },
          100: { value: "#dcfce7" },
          200: { value: "#bbf7d0" },
          300: { value: "#86efac" },
          400: { value: "#4ade80" },
          500: { value: "#22c55e" },
          600: { value: "#16a34a" },
          700: { value: "#15803d" },
          800: { value: "#166534" },
          900: { value: "#14532d" },
        },
      },
      fonts: {
        heading: { value: "'Space Grotesk', system-ui, sans-serif" },
        body: { value: "'Inter', system-ui, sans-serif" },
        mono: { value: "'JetBrains Mono', monospace" },
      },
      shadows: {
        subtle: { value: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" },
        base: { value: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)" },
        elevated: { value: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)" },
        prominent: { value: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)" },
        glow: { value: "0 0 20px rgba(245, 158, 11, 0.3)" },
        "glow-success": { value: "0 0 20px rgba(16, 185, 129, 0.3)" },
        "glow-error": { value: "0 0 20px rgba(239, 68, 68, 0.3)" },
        "inner-light": { value: "inset 0 1px 0 rgba(255, 255, 255, 0.1)" },
      },
      radii: {
        sm: { value: "4px" },
        md: { value: "6px" },
        lg: { value: "8px" },
        xl: { value: "12px" },
        "2xl": { value: "16px" },
        "3xl": { value: "24px" },
        full: { value: "9999px" },
      },
    },
    semanticTokens: {
      colors: {
        // Background semantic tokens
        bg: {
          default: { value: "#ffffff" },
          _dark: { value: "#0f172a" },
        },
        "bg.subtle": {
          default: { value: "#f8fafc" },
          _dark: { value: "#1e293b" },
        },
        "bg.muted": {
          default: { value: "#f1f5f9" },
          _dark: { value: "#334155" },
        },
        "bg.emphasized": {
          default: { value: "#e2e8f0" },
          _dark: { value: "#475569" },
        },
        "bg.panel": {
          default: { value: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)" },
          _dark: { value: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" },
        },
        // Foreground semantic tokens
        fg: {
          default: { value: "#102a43" },
          _dark: { value: "#f1f5f9" },
        },
        "fg.muted": {
          default: { value: "#334e68" },
          _dark: { value: "#94a3b8" },
        },
        "fg.subtle": {
          default: { value: "#627d98" },
          _dark: { value: "#64748b" },
        },
        "fg.inverted": {
          default: { value: "#ffffff" },
          _dark: { value: "#0f172a" },
        },
        // Border semantic tokens
        border: {
          default: { value: "#d9e2ec" },
          _dark: { value: "#334155" },
        },
        "border.muted": {
          default: { value: "#bcccdc" },
          _dark: { value: "#475569" },
        },
        "border.subtle": {
          default: { value: "#f1f5f9" },
          _dark: { value: "#334155" },
        },
        // Brand colors
        brand: {
          default: { value: "{colors.navy.700}" },
          _dark: { value: "{colors.navy.400}" },
        },
        "brand.emphasized": {
          default: { value: "{colors.navy.800}" },
          _dark: { value: "{colors.navy.300}" },
        },
        accent: {
          default: { value: "{colors.amber.500}" },
          _dark: { value: "{colors.amber.400}" },
        },
        "accent.subtle": {
          default: { value: "{colors.amber.100}" },
          _dark: { value: "{colors.amber.900}" },
        },
        // Financial colors
        revenue: {
          default: { value: "{colors.savanna.600}" },
          _dark: { value: "{colors.savanna.400}" },
        },
        expense: {
          default: { value: "{colors.error.500}" },
          _dark: { value: "{colors.error.400}" },
        },
        pending: {
          default: { value: "{colors.amber.500}" },
          _dark: { value: "{colors.amber.400}" },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
