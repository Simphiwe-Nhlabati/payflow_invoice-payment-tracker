import {
  Input as ChakraInput,
  Field,
  InputElement,
} from "@chakra-ui/react";
import type { InputProps as ChakraInputProps } from "@chakra-ui/react";
import * as React from "react";

export interface InputProps extends Omit<ChakraInputProps, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftElement,
      rightElement,
      size = "md",
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    const sizeStyles = {
      sm: { h: "9", fontSize: "sm" },
      md: { h: "10", fontSize: "md" },
      lg: { h: "12", fontSize: "lg" },
    };

    // Use rightElement if provided, otherwise use leftElement as rightElement for icons
    const elementToShow = rightElement || leftElement;

    return (
      <Field.Root invalid={!!error}>
        {label && <Field.Label htmlFor={inputId}>{label}</Field.Label>}
        <Field.Root position="relative">
          <ChakraInput
            ref={ref}
            id={inputId}
            {...sizeStyles[size]}
            {...props}
          />
          {elementToShow && (
            <InputElement placement="end" pointerEvents="none">
              {elementToShow}
            </InputElement>
          )}
        </Field.Root>
        {error ? (
          <Field.ErrorText>{error}</Field.ErrorText>
        ) : helperText ? (
          <Field.HelperText>{helperText}</Field.HelperText>
        ) : null}
      </Field.Root>
    );
  },
);

Input.displayName = "Input";
