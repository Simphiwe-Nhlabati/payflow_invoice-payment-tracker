import { chakra, type HTMLChakraProps } from "@chakra-ui/react";
import * as React from "react";

export interface CardProps extends HTMLChakraProps<"div"> {
  variant?: "elevated" | "outlined" | "subtle";
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "elevated",
  style,
  ...props
}) => {
  const variants: Record<string, React.CSSProperties> = {
    elevated: {
      background: "var(--chakra-colors-bg-panel)",
      boxShadow: "var(--chakra-shadows-prominent)",
      borderRadius: "var(--chakra-radii-xl)",
    },
    outlined: {
      background: "var(--chakra-colors-bg-panel)",
      border: "1px solid var(--chakra-colors-border)",
      borderRadius: "var(--chakra-radii-xl)",
    },
    subtle: {
      background: "var(--chakra-colors-bg-subtle)",
      borderRadius: "var(--chakra-radii-xl)",
    },
  };

  return (
    <chakra.div style={{ ...variants[variant], ...style }} {...props}>
      {children}
    </chakra.div>
  );
};

export interface CardHeaderProps extends HTMLChakraProps<"div"> {
  showDivider?: boolean;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  showDivider = true,
  style,
  ...props
}) => (
  <chakra.div
    style={{
      paddingBottom: showDivider ? "var(--chakra-space-4)" : undefined,
      borderBottom: showDivider ? "1px solid var(--chakra-colors-border-subtle)" : undefined,
      ...style,
    }}
    {...props}
  >
    {children}
  </chakra.div>
);

export interface CardTitleProps extends HTMLChakraProps<"h3"> {}

export const CardTitle: React.FC<CardTitleProps> = ({ children, style, ...props }) => (
  <chakra.h3
    style={{
      fontSize: "var(--chakra-font-sizes-lg)",
      fontWeight: "var(--chakra-font-weights-semibold)",
      color: "var(--chakra-colors-fg)",
      ...style,
    }}
    {...props}
  >
    {children}
  </chakra.h3>
);

export interface CardDescriptionProps extends HTMLChakraProps<"p"> {}

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, style, ...props }) => (
  <chakra.p
    style={{
      fontSize: "var(--chakra-font-sizes-sm)",
      color: "var(--chakra-colors-fg-muted)",
      marginTop: "var(--chakra-space-1)",
      ...style,
    }}
    {...props}
  >
    {children}
  </chakra.p>
);

export interface CardContentProps extends HTMLChakraProps<"div"> {}

export const CardContent: React.FC<CardContentProps> = ({ children, style, ...props }) => (
  <chakra.div style={{ padding: "var(--chakra-space-6)", ...style }} {...props}>
    {children}
  </chakra.div>
);

export interface CardFooterProps extends HTMLChakraProps<"div"> {}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  style,
  ...props
}) => (
  <chakra.div
    style={{
      paddingTop: "var(--chakra-space-4)",
      borderTop: "1px solid var(--chakra-colors-border-subtle)",
      ...style,
    }}
    {...props}
  >
    {children}
  </chakra.div>
);
