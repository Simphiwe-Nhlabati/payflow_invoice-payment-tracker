"use client";

import React from "react";
import { Box, Flex, Icon, Text, HStack, Avatar } from "@chakra-ui/react";
import { Menu, X, LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useColorMode } from "./ui";
import { Button } from "./ui";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  setSidebarOpen,
}) => {
  const { state: authState, logout } = useAuth();
  const { theme, setTheme } = useColorMode();

  const toggleColorMode = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Box
      as="header"
      bg="bg.panel"
      borderBottom="1px solid"
      borderColor="border.subtle"
      shadow="subtle"
      position="sticky"
      top="0"
      zIndex="30"
      backdropFilter="blur(8px)"
    >
      <Flex align="center" justify="space-between" px="4" py="3">
        <Flex align="center" gap="3">
          {/* Mobile menu toggle */}
          <Button
            display={{ base: "flex", md: "none" }}
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            p="2"
            borderRadius="xl"
            _hover={{ bg: "bg.subtle" }}
          >
            <Icon as={sidebarOpen ? X : Menu} boxSize="5" color="fg" />
          </Button>

          {/* Logo for mobile */}
          <Box
            display={{ base: "block", md: "none" }}
            fontSize="lg"
            fontWeight="bold"
            fontFamily="heading"
            color="fg"
            letterSpacing="tight"
          >
            PayFlow
          </Box>
        </Flex>

        <HStack gap="3">
          {/* Color mode toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleColorMode}
            p="2"
            borderRadius="xl"
            _hover={{ bg: "bg.subtle" }}
            aria-label="Toggle color mode"
          >
            <Icon
              as={theme === "dark" ? Sun : Moon}
              boxSize="5"
              color="fg"
            />
          </Button>

          {authState.user ? (
            <>
              {/* User info - desktop */}
              <HStack
                gap="3"
                display={{ base: "none", md: "flex" }}
                px="3"
                py="2"
                borderRadius="xl"
                bg="bg.subtle"
                border="1px solid"
                borderColor="border.subtle"
              >
                <Avatar.Root size="sm">
                  <Avatar.Fallback 
                    name={`${authState.user.firstName} ${authState.user.lastName}`} 
                    style={{ background: "linear-gradient(to bottom right, var(--chakra-colors-navy-600), var(--chakra-colors-navy-800))" }} 
                    color="white" 
                    fontWeight="semibold" 
                  />
                </Avatar.Root>
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color="fg" letterSpacing="wide">
                    {authState.user.firstName} {authState.user.lastName}
                  </Text>
                  <Text fontSize="xs" color="fg.muted" fontWeight="medium">
                    Business Account
                  </Text>
                </Box>
              </HStack>

              {/* Logout button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                display={{ base: "none", md: "flex" }}
                color="fg"
                borderRadius="xl"
                _hover={{ bg: "error.50", color: "error.600" }}
              >
                <Icon as={LogOut} boxSize="4" />
                Sign Out
              </Button>

              {/* Mobile user menu */}
              <Avatar.Root
                size="sm"
                onClick={logout}
                cursor="pointer"
                display={{ base: "flex", md: "none" }}
              >
                <Avatar.Fallback 
                  name={`${authState.user.firstName} ${authState.user.lastName}`} 
                  style={{ background: "linear-gradient(to bottom right, var(--chakra-colors-navy-600), var(--chakra-colors-navy-800))" }} 
                  color="white" 
                  fontWeight="semibold" 
                />
              </Avatar.Root>
            </>
          ) : (
            <HStack gap="2">
              <Avatar.Root size="sm">
                <Avatar.Fallback bg="gray.200" color="gray.500">
                  <Icon as={Menu} boxSize="4" />
                </Avatar.Fallback>
              </Avatar.Root>
              <Text fontSize="sm" fontWeight="medium" color="fg" display={{ base: "none", md: "block" }}>
                Guest
              </Text>
            </HStack>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;
