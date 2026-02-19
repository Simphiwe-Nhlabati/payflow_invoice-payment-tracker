import { Badge as ChakraBadge, type BadgeProps as ChakraBadgeProps } from "@chakra-ui/react";

export interface BadgeProps extends Omit<ChakraBadgeProps, "variant"> {
  variant?: "solid" | "subtle" | "outline";
  colorScheme?:
    | "navy"
    | "amber"
    | "success"
    | "error"
    | "gray"
    | "blue"
    | "purple";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "subtle",
  colorScheme = "gray",
  size = "sm",
  ...props
}) => {
  const colorSchemes: Record<string, Record<string, Record<string, string>>> = {
    navy: {
      solid: { bg: "navy.700", color: "white" },
      subtle: { bg: "navy.100", color: "navy.800" },
      outline: { borderColor: "navy.300", color: "navy.700" },
    },
    amber: {
      solid: { bg: "amber.500", color: "white" },
      subtle: { bg: "amber.100", color: "amber.800" },
      outline: { borderColor: "amber.300", color: "amber.700" },
    },
    success: {
      solid: { bg: "success.500", color: "white" },
      subtle: { bg: "success.100", color: "success.800" },
      outline: { borderColor: "success.300", color: "success.700" },
    },
    error: {
      solid: { bg: "error.500", color: "white" },
      subtle: { bg: "error.100", color: "error.800" },
      outline: { borderColor: "error.300", color: "error.700" },
    },
    gray: {
      solid: { bg: "gray.600", color: "white" },
      subtle: { bg: "gray.100", color: "gray.800" },
      outline: { borderColor: "gray.300", color: "gray.700" },
    },
    blue: {
      solid: { bg: "blue.500", color: "white" },
      subtle: { bg: "blue.100", color: "blue.800" },
      outline: { borderColor: "blue.300", color: "blue.700" },
    },
    purple: {
      solid: { bg: "purple.500", color: "white" },
      subtle: { bg: "purple.100", color: "purple.800" },
      outline: { borderColor: "purple.300", color: "purple.700" },
    },
  };

  const sizeStyles: Record<string, object> = {
    sm: { fontSize: "xs", px: "2", py: "0.5" },
    md: { fontSize: "sm", px: "2.5", py: "1" },
  };

  const scheme = colorSchemes[colorScheme]?.[variant] || colorSchemes.gray[variant];

  return (
    <ChakraBadge
      {...scheme}
      {...sizeStyles[size]}
      {...props}
    >
      {children}
    </ChakraBadge>
  );
};
