import { Box, Button as ChakraButton, Spinner, type ButtonProps as ChakraButtonProps } from "@chakra-ui/react";
import * as React from "react";

export interface ButtonProps extends Omit<ChakraButtonProps, "variant"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref,
  ) => {
    const variantStyles: Record<string, object> = {
      primary: {
        bg: "navy.700",
        color: "white",
        _hover: { bg: "navy.800" },
        _dark: {
          bg: "navy.600",
          _hover: { bg: "navy.500" },
        },
      },
      secondary: {
        bg: "amber.500",
        color: "white",
        _hover: { bg: "amber.600" },
        _dark: {
          bg: "amber.600",
          _hover: { bg: "amber.500" },
        },
      },
      outline: {
        variant: "outline",
        borderColor: "border",
        color: "fg",
        _hover: { bg: "bg.subtle" },
      },
      ghost: {
        variant: "ghost",
        color: "fg",
        _hover: { bg: "bg.subtle" },
      },
      danger: {
        bg: "error.500",
        color: "white",
        _hover: { bg: "error.600" },
      },
      success: {
        bg: "success.500",
        color: "white",
        _hover: { bg: "success.600" },
      },
    };

    const sizeStyles: Record<string, object> = {
      sm: {
        h: "8",
        px: "3",
        fontSize: "sm",
        borderRadius: "lg",
      },
      md: {
        h: "10",
        px: "4",
        fontSize: "md",
        borderRadius: "xl",
      },
      lg: {
        h: "12",
        px: "6",
        fontSize: "lg",
        borderRadius: "2xl",
      },
    };

    return (
      <ChakraButton
        ref={ref}
        disabled={disabled || isLoading}
        {...variantStyles[variant]}
        {...sizeStyles[size]}
        {...props}
      >
        {isLoading ? (
          <Spinner size="sm" color="currentColor" />
        ) : (
          <>
            {leftIcon && <Box display="inline-flex" mr="2">{leftIcon}</Box>}
            {children}
            {rightIcon && <Box display="inline-flex" ml="2">{rightIcon}</Box>}
          </>
        )}
      </ChakraButton>
    );
  },
);

Button.displayName = "Button";
