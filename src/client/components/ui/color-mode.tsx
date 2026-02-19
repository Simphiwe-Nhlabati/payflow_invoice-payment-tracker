"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";

export interface ColorModeProviderProps {
  children: React.ReactNode;
  defaultTheme?: "light" | "dark" | "system";
  forcedTheme?: "light" | "dark" | "system";
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

export const ColorModeProvider: React.FC<ColorModeProviderProps> = ({
  children,
  defaultTheme = "light",
  enableSystem = true,
  disableTransitionOnChange = false,
  forcedTheme,
}) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
      forcedTheme={forcedTheme}
    >
      {children}
    </ThemeProvider>
  );
};

export { useTheme as useColorMode } from "next-themes";
