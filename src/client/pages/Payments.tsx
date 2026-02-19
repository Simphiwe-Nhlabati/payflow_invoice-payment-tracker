"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentSchema } from "../../types/schemas";
import type { CreatePaymentData, Payment, Invoice } from "../api";
import { paymentApi, invoiceApi } from "../api";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Heading,
  Icon,
  Spinner,
  SimpleGrid,
  Field,
  Textarea,
} from "@chakra-ui/react";
import { Plus, Edit, Trash2, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from "../components/ui";

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreatePaymentData>({
    resolver: zodResolver(paymentSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [paymentsResponse, invoicesResponse] = await Promise.all([
          paymentApi.getAll(),
          invoiceApi.getAll(),
        ]);
        setPayments(paymentsResponse.data.data.payments);
        setInvoices(invoicesResponse.data.data.invoices);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: CreatePaymentData) => {
    try {
      const paymentData = {
        ...data,
        amount: Math.round(data.amount * 100),
      };

      if (editingPayment) {
        const response = await paymentApi.update(editingPayment.id, paymentData);
        setPayments(
          payments.map((p) =>
            p.id === editingPayment.id ? response.data.data.payment : p
          )
        );
        setEditingPayment(null);
      } else {
        const response = await paymentApi.create(paymentData);
        setPayments([...payments, response.data.data.payment]);
      }

      reset();
      setShowForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setShowForm(true);
    setValue("invoiceId", payment.invoiceId);
    setValue("amount", payment.amount / 100);
    setValue("method", payment.method);
    setValue("paymentDate", payment.paymentDate.split("T")[0]);
    setValue("reference", payment.reference || "");
    setValue("notes", payment.notes || "");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      try {
        await paymentApi.delete(id);
        setPayments(payments.filter((payment) => payment.id !== id));
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to delete payment");
      }
    }
  };

  const handleCancel = () => {
    setEditingPayment(null);
    reset();
    setShowForm(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getMethodBadgeColor = (method: string) => {
    switch (method) {
      case "bank_transfer":
        return "blue";
      case "credit_card":
        return "purple";
      case "payfast":
        return "amber";
      case "cash":
        return "success";
      default:
        return "gray";
    }
  };

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" h="64">
        <Spinner size="xl" color="navy.700" />
      </Flex>
    );
  }

  return (
    <VStack gap="6" align="stretch">
      {/* Header */}
      <Flex justifyContent="space-between" alignItems="center">
        <Heading size="lg" fontFamily="heading">
          Payments
        </Heading>
        <Button
          variant="primary"
          leftIcon={<Icon as={Plus} boxSize="4" />}
          onClick={() => {
            setEditingPayment(null);
            reset();
            setShowForm(true);
          }}
        >
          Record Payment
        </Button>
      </Flex>

      {error && (
        <Card variant="subtle" bg="error.50" border="1px solid" borderColor="error.200">
          <CardContent py="3">
            <HStack gap="2">
              <Box w="2" h="2" borderRadius="full" bg="error.500" />
              <Text fontSize="sm" color="error.700" fontWeight="medium">
                {error}
              </Text>
            </HStack>
          </CardContent>
        </Card>
      )}

      {/* Payment Form */}
      {showForm && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>
              {editingPayment ? "Edit Payment" : "Record New Payment"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap="4" mb="6">
                <Field.Root>
                  <Field.Label>Invoice</Field.Label>
                  <select
                    className="chakra-select"
                    value={watch("invoiceId")}
                    onChange={(e) => setValue("invoiceId", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "var(--chakra-space-2) var(--chakra-space-3)",
                      borderRadius: "var(--chakra-radii-md)",
                      border: "1px solid var(--chakra-colors-border)",
                      background: "var(--chakra-colors-bg)",
                      color: "var(--chakra-colors-fg)",
                      fontSize: "var(--chakra-font-sizes-md)",
                    }}
                  >
                    <option value="">Select an invoice</option>
                    {invoices
                      .filter((invoice) => invoice.status !== "paid")
                      .map((invoice) => (
                        <option key={invoice.id} value={invoice.id}>
                          {invoice.invoiceNumber} - {invoice.client.name} (
                          {formatCurrency(invoice.total)})
                        </option>
                      ))}
                  </select>
                  {errors.invoiceId && (
                    <Field.ErrorText>{errors.invoiceId.message}</Field.ErrorText>
                  )}
                </Field.Root>

                <Input
                  {...register("amount", { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  label="Amount (ZAR)"
                  placeholder="0.00"
                  error={errors.amount?.message}
                />

                <Field.Root>
                  <Field.Label>Payment Method</Field.Label>
                  <select
                    className="chakra-select"
                    value={watch("method")}
                    onChange={(e) => setValue("method", e.target.value as "cash" | "bank_transfer" | "credit_card" | "payfast" | "other")}
                    style={{
                      width: "100%",
                      padding: "var(--chakra-space-2) var(--chakra-space-3)",
                      borderRadius: "var(--chakra-radii-md)",
                      border: "1px solid var(--chakra-colors-border)",
                      background: "var(--chakra-colors-bg)",
                      color: "var(--chakra-colors-fg)",
                      fontSize: "var(--chakra-font-sizes-md)",
                    }}
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="payfast">PayFast</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.method && (
                    <Field.ErrorText>{errors.method.message}</Field.ErrorText>
                  )}
                </Field.Root>

                <Input
                  {...register("paymentDate")}
                  type="date"
                  label="Payment Date"
                  error={errors.paymentDate?.message}
                />

                <Input
                  {...register("reference")}
                  label="Reference"
                  placeholder="Transaction ID, cheque number, etc."
                  error={errors.reference?.message}
                />
              </SimpleGrid>

              <Field.Root mb="6">
                <Field.Label>Notes</Field.Label>
                <Textarea
                  {...register("notes")}
                  rows={3}
                  placeholder="Additional notes about the payment"
                />
              </Field.Root>

              <HStack gap="3">
                <Button type="submit" variant="primary">
                  {editingPayment ? "Update Payment" : "Record Payment"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </HStack>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Payments List */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
        {payments.length === 0 ? (
          <Box
            gridColumn={{ base: "1 / -1", md: "1 / -1", lg: "1 / -1" }}
            py="12"
            textAlign="center"
          >
            <Text color="fg.muted">No payments recorded yet.</Text>
          </Box>
        ) : (
          payments.map((payment) => (
            <Card key={payment.id} variant="outlined">
              <CardContent>
                <Flex justify="space-between" align="start" mb="3">
                  <VStack gap="1" align="start">
                    <HStack gap="2">
                      <Box
                        w="8"
                        h="8"
                        borderRadius="full"
                        bg="success.100"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={CreditCard} boxSize="4" color="success.600" />
                      </Box>
                      <Text fontWeight="semibold" color="fg">
                        {payment.invoice
                          ? payment.invoice.invoiceNumber
                          : `Payment ${payment.id}`}
                      </Text>
                    </HStack>
                    {payment.invoice && (
                      <Text fontSize="sm" color="fg.muted">
                        {payment.invoice.client.name}
                      </Text>
                    )}
                  </VStack>
                  <Badge
                    colorScheme={getMethodBadgeColor(payment.method)}
                    variant="subtle"
                  >
                    {payment.method.replace("_", " ")}
                  </Badge>
                </Flex>

                <VStack gap="2" align="start" mb="4">
                  <HStack gap="2">
                    <Text fontSize="sm" color="fg.subtle">
                      Amount:
                    </Text>
                    <Text fontSize="lg" fontWeight="semibold" color="fg">
                      {formatCurrency(payment.amount)}
                    </Text>
                  </HStack>
                  <HStack gap="2">
                    <Text fontSize="sm" color="fg.subtle">
                      Date:
                    </Text>
                    <Text fontSize="sm" color="fg">
                      {formatDate(payment.paymentDate)}
                    </Text>
                  </HStack>
                  {payment.reference && (
                    <HStack gap="2">
                      <Text fontSize="sm" color="fg.subtle">
                        Reference:
                      </Text>
                      <Text fontSize="sm" color="fg">
                        {payment.reference}
                      </Text>
                    </HStack>
                  )}
                </VStack>

                {payment.notes && (
                  <Box
                    mb="4"
                    p="3"
                    bg="bg.subtle"
                    borderRadius="md"
                  >
                    <Text fontSize="sm" color="fg.muted">
                      {payment.notes}
                    </Text>
                  </Box>
                )}

                <HStack gap="2">
                  <Button
                    variant="outline"
                    size="sm"
                    flex="1"
                    leftIcon={<Icon as={Edit} boxSize="4" />}
                    onClick={() => handleEdit(payment)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    colorScheme="red"
                    flex="1"
                    leftIcon={<Icon as={Trash2} boxSize="4" />}
                    onClick={() => handleDelete(payment.id)}
                  >
                    Delete
                  </Button>
                </HStack>
              </CardContent>
            </Card>
          ))
        )}
      </SimpleGrid>
    </VStack>
  );
};

export default Payments;
