import { ChakraProvider } from "@chakra-ui/react";
import { ColorModeProvider } from "./color-mode";
import { system } from "../../styles/theme";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider defaultTheme="light" enableSystem={false}>
        {children}
      </ColorModeProvider>
    </ChakraProvider>
  );
}
