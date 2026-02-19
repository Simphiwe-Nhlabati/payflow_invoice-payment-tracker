"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Heading,
  Icon,
  Spinner,
  SimpleGrid,
  HStack,
  VStack,
} from "@chakra-ui/react";
import {
  DollarSign,
  Users,
  FileText,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { clientApi, invoiceApi, paymentApi } from "../api";
import type { Invoice } from "../api";
import { Card, CardContent, Badge } from "../components/ui";

interface ActivityItem {
  type: "invoice" | "payment";
  date: string;
  description: string;
  amount: number;
  status: string;
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stats
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [activeClients, setActiveClients] = useState<number>(0);
  const [unpaidInvoices, setUnpaidInvoices] = useState<number>(0);
  const [pendingPayments, setPendingPayments] = useState<number>(0);

  // Lists
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [upcomingInvoices, setUpcomingInvoices] = useState<Invoice[]>([]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount / 100);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [clientsResponse, invoicesResponse, paymentsResponse] =
          await Promise.all([
            clientApi.getAll(),
            invoiceApi.getAll(),
            paymentApi.getAll(),
          ]);

        const clients = clientsResponse.data.data.clients;
        const invoices = invoicesResponse.data.data.invoices;
        const payments = paymentsResponse.data.data.payments;

        // Calculate stats
        const paidInvoices = invoices.filter((inv) => inv.status === "paid");
        const totalRev = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
        setTotalRevenue(totalRev);

        const clientIds = new Set(invoices.map((inv) => inv.clientId));
        setActiveClients(clientIds.size);

        const unpaidInv = invoices.filter((inv) => inv.status !== "paid");
        setUnpaidInvoices(unpaidInv.length);

        const pendingPay = payments.reduce((sum, pay) => sum + pay.amount, 0);
        setPendingPayments(pendingPay);

        // Recent activity
        const allActivity = [
          ...invoices
            .filter((inv) => inv.client)
            .map((inv) => ({
              type: "invoice" as const,
              date: inv.createdAt,
              description: `Invoice ${inv.invoiceNumber} for ${inv.client.name}`,
              amount: inv.total,
              status: inv.status,
            })),
          ...payments
            .filter((pay) => pay.invoice)
            .map((pay) => ({
              type: "payment" as const,
              date: pay.createdAt,
              description: `Payment for ${pay.invoice.invoiceNumber}`,
              amount: pay.amount,
              status: "completed",
            })),
        ]
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .slice(0, 5);

        setRecentActivity(allActivity);

        // Upcoming invoices
        const upcoming = invoices
          .filter((inv) => inv.status !== "paid" && inv.client)
          .sort(
            (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          )
          .slice(0, 5);

        setUpcomingInvoices(upcoming);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load dashboard data");
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Flex justify="center" align="center" h="64">
        <VStack gap="4">
          <Spinner size="xl" color="navy.700" />
          <Text fontSize="sm" color="fg.muted" fontFamily="heading">
            Loading your financial overview...
          </Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <VStack gap="8" align="stretch" w="full">
      {/* Header with distinctive styling */}
      <Flex justify="space-between" align="center" pb="4" borderBottom="1px solid" borderColor="border.subtle" w="full">
        <VStack gap="1" align="start">
          <Heading size="xl" fontFamily="heading" color="fg" letterSpacing="tight">
            Dashboard
          </Heading>
          <Text color="fg.muted" fontSize="md">
            Welcome back! Here's your financial overview.
          </Text>
        </VStack>
        <HStack gap="2" px="4" py="2" bg="success.50" borderRadius="full" border="1px solid" borderColor="success.200">
          <Box w="2" h="2" borderRadius="full" bg="success.500" animation="pulse 2s infinite" />
          <Text fontSize="xs" fontWeight="medium" color="success.700" textTransform="uppercase" letterSpacing="wide">
            Live Data
          </Text>
        </HStack>
      </Flex>

      {error && (
        <Card variant="outlined" borderColor="error.300" bg="error.50">
          <CardContent>
            <HStack gap="2">
              <Box w="2" h="2" borderRadius="full" bg="error.500" />
              <Text fontSize="sm" fontWeight="medium" color="error.700">
                {error}
              </Text>
            </HStack>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid with distinctive cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="6">
        {/* Total Revenue */}
        <Card variant="elevated" position="relative" overflow="hidden">
          <Box position="absolute" top="0" left="0" w="full" h="1" style={{ background: "linear-gradient(to right, var(--chakra-colors-savanna-400), var(--chakra-colors-savanna-600))" }} />
          <CardContent>
            <Flex justify="space-between" align="start" mb="4">
              <Text fontSize="xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase" letterSpacing="wide">
                Total Revenue
              </Text>
              <Box
                w="12"
                h="12"
                borderRadius="xl"
                bg="savanna.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
                shadow="sm"
              >
                <Icon as={DollarSign} boxSize="6" color="savanna.600" />
              </Box>
            </Flex>
            <VStack gap="1" align="start">
              <Heading size="2xl" fontFamily="heading" color="savanna.600" letterSpacing="tight">
                {formatCurrency(totalRevenue)}
              </Heading>
              <HStack gap="1">
                <Icon as={TrendingUp} boxSize="3" color="savanna.500" />
                <Text fontSize="xs" color="fg.subtle" fontWeight="medium">
                  +12.5% from last month
                </Text>
              </HStack>
            </VStack>
          </CardContent>
        </Card>

        {/* Active Clients */}
        <Card variant="elevated" position="relative" overflow="hidden">
          <Box position="absolute" top="0" left="0" w="full" h="1" style={{ background: "linear-gradient(to right, var(--chakra-colors-ocean-400), var(--chakra-colors-ocean-600))" }} />
          <CardContent>
            <Flex justify="space-between" align="start" mb="4">
              <Text fontSize="xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase" letterSpacing="wide">
                Active Clients
              </Text>
              <Box
                w="12"
                h="12"
                borderRadius="xl"
                bg="ocean.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
                shadow="sm"
              >
                <Icon as={Users} boxSize="6" color="ocean.600" />
              </Box>
            </Flex>
            <VStack gap="1" align="start">
              <Heading size="2xl" fontFamily="heading" color="ocean.600" letterSpacing="tight">
                {activeClients}
              </Heading>
              <Text fontSize="xs" color="fg.subtle" fontWeight="medium">
                +2 new this month
              </Text>
            </VStack>
          </CardContent>
        </Card>

        {/* Unpaid Invoices */}
        <Card variant="elevated" position="relative" overflow="hidden">
          <Box position="absolute" top="0" left="0" w="full" h="1" style={{ background: "linear-gradient(to right, var(--chakra-colors-amber-400), var(--chakra-colors-amber-600))" }} />
          <CardContent>
            <Flex justify="space-between" align="start" mb="4">
              <Text fontSize="xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase" letterSpacing="wide">
                Unpaid Invoices
              </Text>
              <Box
                w="12"
                h="12"
                borderRadius="xl"
                bg="amber.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
                shadow="sm"
              >
                <Icon as={FileText} boxSize="6" color="amber.600" />
              </Box>
            </Flex>
            <VStack gap="1" align="start">
              <Heading size="2xl" fontFamily="heading" color="amber.600" letterSpacing="tight">
                {unpaidInvoices}
              </Heading>
              <Text fontSize="xs" color="fg.subtle" fontWeight="medium">
                3 overdue
              </Text>
            </VStack>
          </CardContent>
        </Card>

        {/* Pending Payments */}
        <Card variant="elevated" position="relative" overflow="hidden">
          <Box position="absolute" top="0" left="0" w="full" h="1" style={{ background: "linear-gradient(to right, var(--chakra-colors-safari-400), var(--chakra-colors-safari-600))" }} />
          <CardContent>
            <Flex justify="space-between" align="start" mb="4">
              <Text fontSize="xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase" letterSpacing="wide">
                Pending Payments
              </Text>
              <Box
                w="12"
                h="12"
                borderRadius="xl"
                bg="safari.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
                shadow="sm"
              >
                <Icon as={CreditCard} boxSize="6" color="safari.600" />
              </Box>
            </Flex>
            <VStack gap="1" align="start">
              <Heading size="2xl" fontFamily="heading" color="safari.600" letterSpacing="tight">
                {formatCurrency(pendingPayments)}
              </Heading>
              <Text fontSize="xs" color="fg.subtle" fontWeight="medium">
                5 transactions
              </Text>
            </VStack>
          </CardContent>
        </Card>
      </SimpleGrid>

      {/* Activity and Invoices with refined styling */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="8">
        {/* Recent Activity */}
        <Card variant="elevated">
          <Flex justify="space-between" align="center" mb="6" px="6" pt="6" borderBottom="1px solid" borderColor="border.subtle">
            <HStack gap="3">
              <Box w="2" h="2" borderRadius="full" bg="savanna.500" />
              <Heading size="md" fontFamily="heading" letterSpacing="tight">
                Recent Activity
              </Heading>
            </HStack>
          </Flex>
          <CardContent px="6" pb="6">
            {recentActivity.length > 0 ? (
              <VStack gap="3" align="stretch">
                {recentActivity.map((activity, index) => (
                  <Flex
                    key={index}
                    justify="space-between"
                    align="center"
                    px="4"
                    py="3"
                    borderRadius="lg"
                    _hover={{ bg: "bg.subtle", transform: "translateX(4px)", borderColor: "border.subtle" }}
                    transition="all 0.2s ease"
                    border="1px solid"
                    borderColor="transparent"
                  >
                    <VStack gap="0.5" align="start" flex="1">
                      <Text fontSize="sm" fontWeight="medium" color="fg">
                        {activity.description}
                      </Text>
                      <Text fontSize="xs" color="fg.muted">
                        {formatDate(activity.date)}
                      </Text>
                    </VStack>
                    <HStack gap="3">
                      <Text fontSize="sm" fontWeight="semibold" color="fg">
                        {formatCurrency(activity.amount)}
                      </Text>
                      <Badge
                        colorScheme={activity.type === "invoice" ? "amber" : "success"}
                        variant="subtle"
                      >
                        {activity.type}
                      </Badge>
                    </HStack>
                  </Flex>
                ))}
              </VStack>
            ) : (
              <Flex direction="column" align="center" py="12" gap="4">
                <Box
                  w="16"
                  h="16"
                  borderRadius="2xl"
                  bg="bg.muted"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  shadow="inner-light"
                >
                  <Icon as={FileText} boxSize="8" color="fg.subtle" />
                </Box>
                <VStack gap="1" align="center">
                  <Text fontWeight="medium" color="fg">No recent activity</Text>
                  <Text fontSize="sm" color="fg.muted">Your financial activity will appear here</Text>
                </VStack>
              </Flex>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Invoices */}
        <Card variant="elevated">
          <Flex justify="space-between" align="center" mb="6" px="6" pt="6" borderBottom="1px solid" borderColor="border.subtle">
            <HStack gap="3">
              <Box w="2" h="2" borderRadius="full" bg="amber.500" />
              <Heading size="md" fontFamily="heading" letterSpacing="tight">
                Upcoming Invoices
              </Heading>
            </HStack>
          </Flex>
          <CardContent px="6" pb="6">
            {upcomingInvoices.length > 0 ? (
              <VStack gap="3" align="stretch">
                {upcomingInvoices.map((invoice) => {
                  const isOverdue = new Date(invoice.dueDate) < new Date();
                  return (
                    <Flex
                      key={invoice.id}
                      justify="space-between"
                      align="center"
                      px="4"
                      py="3"
                      borderRadius="lg"
                      _hover={{ bg: "bg.subtle", transform: "translateX(4px)", borderColor: "border.subtle" }}
                      transition="all 0.2s ease"
                      border="1px solid"
                      borderColor="transparent"
                    >
                      <VStack gap="0.5" align="start" flex="1">
                        <Text fontSize="sm" fontWeight="medium" color="fg">
                          {invoice.invoiceNumber} - {invoice.client.name}
                        </Text>
                        <Text fontSize="xs" color="fg.muted">
                          Due: {formatDate(invoice.dueDate)}
                        </Text>
                      </VStack>
                      <HStack gap="3">
                        <Text fontSize="sm" fontWeight="semibold" color="fg">
                          {formatCurrency(invoice.total)}
                        </Text>
                        <Badge
                          colorScheme={isOverdue ? "error" : "amber"}
                          variant="subtle"
                        >
                          {isOverdue ? "Overdue" : "Pending"}
                        </Badge>
                      </HStack>
                    </Flex>
                  );
                })}
              </VStack>
            ) : (
              <Flex direction="column" alignItems="center" py="12" gap="4">
                <Box
                  w="16"
                  h="16"
                  borderRadius="2xl"
                  bg="bg.muted"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  shadow="inner-light"
                >
                  <Icon as={FileText} boxSize="8" color="fg.subtle" />
                </Box>
                <VStack gap="1" align="center">
                  <Text fontWeight="medium" color="fg">No upcoming invoices</Text>
                  <Text fontSize="sm" color="fg.muted">Create an invoice to get started</Text>
                </VStack>
              </Flex>
            )}
          </CardContent>
        </Card>
      </SimpleGrid>
    </VStack>
  );
};

export default Dashboard;
