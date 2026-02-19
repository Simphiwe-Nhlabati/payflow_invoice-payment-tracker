"use client";

import React from "react";
import { Box, Flex, Icon, HStack, VStack } from "@chakra-ui/react";
import { Home, Users, FileText, CreditCard, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "./ui";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const navItems = [
  { name: "Dashboard", icon: Home, path: "/dashboard" },
  { name: "Clients", icon: Users, path: "/clients" },
  { name: "Invoices", icon: FileText, path: "/invoices" },
  { name: "Payments", icon: CreditCard, path: "/payments" },
  { name: "Settings", icon: Settings, path: "/settings" },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <Box
          display={{ base: "block", md: "none" }}
          position="fixed"
          inset="0"
          bg="black/50"
          zIndex="40"
          onClick={onClose}
        />
      )}

      <Box
        as="aside"
        display={{ base: isOpen ? "block" : "none", md: "block" }}
        position={{ md: "fixed" }}
        insetY={{ md: "0" }}
        left={{ md: "0" }}
        w="64"
        h="full"
        bg="bg.panel"
        borderRight="1px solid"
        borderColor="border"
        shadow={{ md: "subtle" }}
        zIndex="50"
        transition="transform 0.3s ease-in-out"
      >
        <Flex direction="column" h="full">
          {/* Logo */}
          <Flex
            align="center"
            justify="space-between"
            px="6"
            py="5"
            borderBottom="1px solid"
            borderColor="border.subtle"
            style={{ background: "linear-gradient(to bottom, var(--chakra-colors-bg-panel), var(--chakra-colors-bg-subtle))" }}
          >
            <HStack gap="3">
              <Box
                w="10"
                h="10"
                borderRadius="xl"
                style={{ background: "linear-gradient(to bottom right, var(--chakra-colors-navy-700), var(--chakra-colors-navy-900))" }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                shadow="md"
              >
                <Box fontSize="lg" fontWeight="bold" color="white" fontFamily="heading">
                  P
                </Box>
              </Box>
              <Box>
                <Box fontSize="lg" fontWeight="bold" fontFamily="heading" color="fg" letterSpacing="tight">
                  PayFlow
                </Box>
                <Box fontSize="xs" color="fg.muted" fontWeight="medium">
                  Business Finance
                </Box>
              </Box>
            </HStack>
            <Badge colorScheme="success" size="sm" variant="subtle">
              Active
            </Badge>
          </Flex>

          {/* Navigation */}
          <Box flex="1" px="4" py="4" overflowY="auto">
            <VStack gap="1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={onClose}
                  >
                    <HStack
                      px="3"
                      py="3"
                      borderRadius="lg"
                      transition="all 0.2s ease"
                      bg={isActive ? "navy.700" : "transparent"}
                      color={isActive ? "white" : "fg"}
                      _hover={{
                        bg: isActive ? "navy.700" : "bg.subtle",
                        transform: isActive ? "none" : "translateX(4px)",
                        shadow: isActive ? "md" : "none",
                      }}
                      position="relative"
                      w="full"
                      justify="flex-start"
                      align="center"
                      gap="3"
                    >
                      {isActive && (
                        <Box
                          position="absolute"
                          left="0"
                          top="50%"
                          transform="translateY(-50%)"
                          w="1"
                          h="60%"
                          bg="amber.400"
                          borderRadius="full"
                        />
                      )}
                      <Icon
                        as={item.icon}
                        boxSize="5"
                        color={isActive ? "white" : "fg.subtle"}
                      />
                      <Box
                        fontSize="sm"
                        fontWeight={isActive ? "semibold" : "medium"}
                        fontFamily="body"
                        letterSpacing="wide"
                        textAlign="left"
                        flex="1"
                      >
                        {item.name}
                      </Box>
                    </HStack>
                  </Link>
                );
              })}
            </VStack>
          </Box>

          {/* User section */}
          <Box
            px="4"
            py="4"
            borderTop="1px solid"
            borderColor="border.subtle"
            style={{ background: "linear-gradient(to top, var(--chakra-colors-bg-subtle), transparent)" }}
          >
            <HStack gap="3" mb="3">
              <Box
                w="10"
                h="10"
                borderRadius="xl"
                style={{ background: "linear-gradient(to bottom right, var(--chakra-colors-ocean-100), var(--chakra-colors-ocean-200))" }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                border="2px solid"
                borderColor="ocean.300"
              >
                <Icon as={Users} boxSize="5" color="ocean.600" />
              </Box>
              <Box>
                <Box fontSize="sm" fontWeight="semibold" color="fg" letterSpacing="wide">
                  Business Account
                </Box>
                <Box fontSize="xs" color="fg.muted" fontWeight="medium">
                  admin@payflow.co.za
                </Box>
              </Box>
            </HStack>
          </Box>
        </Flex>
      </Box>
    </>
  );
};

export default Sidebar;
