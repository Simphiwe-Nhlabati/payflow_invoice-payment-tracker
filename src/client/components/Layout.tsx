"use client";

import React, { useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Box minH="100vh" bg="bg">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <Flex direction="column" ml={{ md: "64" }} minH="100vh" w={{ base: "full", md: "calc(100% - var(--chakra-sizes-64))" }}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <Box as="main" flex="1" overflowY="auto" w="full">
          <Box px="6" py="8" w="full">
            {children}
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default Layout;
