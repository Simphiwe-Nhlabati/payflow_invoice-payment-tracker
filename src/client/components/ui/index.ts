export { Provider } from "./provider";
export { ColorModeProvider, useColorMode } from "./color-mode";
export { Button, type ButtonProps } from "./button";
export { Input, type InputProps } from "./input";
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  type CardProps,
  type CardHeaderProps,
  type CardTitleProps,
  type CardDescriptionProps,
  type CardContentProps,
  type CardFooterProps,
} from "./card";
export { Badge, type BadgeProps } from "./badge";

// Re-export commonly used Chakra UI components
export {
  Box,
  Flex,
  Stack,
  HStack,
  VStack,
  Text,
  Heading,
  Icon,
  Separator,
  Avatar as ChakraAvatar,
  Table as ChakraTable,
  Tabs as ChakraTabs,
  Alert as ChakraAlert,
  Spinner,
  Checkbox,
  Switch,
  Select,
  Textarea,
  Menu,
  Dialog,
  Portal,
  Tooltip,
  useDisclosure,
  SimpleGrid,
  Field,
  InputElement,
  Input as ChakraInput,
  Link as ChakraLink,
} from "@chakra-ui/react";

// Export types
export type {
  BoxProps,
  FlexProps,
  StackProps,
  TextProps,
  HeadingProps,
  IconProps,
  SeparatorProps,
  SpinnerProps,
  TextareaProps,
  UseTooltipProps as TooltipProps,
  SimpleGridProps,
  InputProps as ChakraInputProps,
  LinkProps as ChakraLinkProps,
} from "@chakra-ui/react";
