"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createInvoiceSchema } from "../../types/schemas";
import type { CreateInvoiceData } from "../../types/models";
import { invoiceApi } from "../api/invoiceApi";
import { clientApi } from "../api/clientApi";
import type { Invoice, Client } from "../../types/models";
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
import { Plus, Trash2, Edit, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from "../components/ui";

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
  } = useForm<CreateInvoiceData>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      clientId: "",
      issueDate: "",
      dueDate: "",
      currency: "ZAR",
      notes: "",
      items: [{ description: "", quantity: 1, unitPrice: 0, total: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const items = watch("items");

  const subtotal = items.reduce(
    (sum, item) => sum + (item.quantity * item.unitPrice || 0),
    0
  );
  const vatAmount = subtotal * 0.15;
  const total = subtotal + vatAmount;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [invoicesResponse, clientsResponse] = await Promise.all([
          invoiceApi.getAll(),
          clientApi.getAll(),
        ]);
        setInvoices(invoicesResponse.data.data.invoices);
        setClients(clientsResponse.data.data.clients);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: CreateInvoiceData) => {
    try {
      const invoiceData = {
        clientId: data.clientId,
        issueDate: data.issueDate,
        dueDate: data.dueDate,
        currency: data.currency || "ZAR",
        notes: data.notes,
        items: data.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: Math.round(item.unitPrice * 100),
          total: Math.round((item.quantity * item.unitPrice) * 100),
        })),
      };

      if (editingInvoice) {
        const response = await invoiceApi.update(editingInvoice.id, invoiceData);
        setInvoices(
          invoices.map((inv) =>
            inv.id === editingInvoice.id ? response.data.data.invoice : inv
          )
        );
        setEditingInvoice(null);
      } else {
        const response = await invoiceApi.create(invoiceData);
        setInvoices([...invoices, response.data.data.invoice]);
      }

      reset();
      setShowForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setShowForm(true);
    setValue("clientId", invoice.clientId);
    setValue("issueDate", invoice.issueDate.split("T")[0]);
    setValue("dueDate", invoice.dueDate.split("T")[0]);
    setValue("currency", invoice.currency);
    setValue("notes", invoice.notes || "");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await invoiceApi.delete(id);
        setInvoices(invoices.filter((invoice) => invoice.id !== id));
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to delete invoice");
      }
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      const response = await invoiceApi.markAsPaid(id);
      setInvoices(
        invoices.map((inv) =>
          inv.id === id ? response.data.data.invoice : inv
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to mark as paid");
    }
  };

  const handleCancel = () => {
    setEditingInvoice(null);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "success";
      case "overdue":
        return "error";
      default:
        return "amber";
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="64">
        <Spinner size="xl" color="navy.700" />
      </Flex>
    );
  }

  return (
    <VStack gap="6" align="stretch">
      {/* Header */}
      <Flex justify="space-between" align="center">
        <Heading size="lg" fontFamily="heading">
          Invoices
        </Heading>
        <Button
          variant="primary"
          leftIcon={<Icon as={Plus} boxSize="4" />}
          onClick={() => {
            setEditingInvoice(null);
            reset();
            setShowForm(true);
          }}
        >
          Create Invoice
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

      {/* Invoice Form */}
      {showForm && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>
              {editingInvoice ? "Edit Invoice" : "Create New Invoice"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap="4" mb="6">
                <Field.Root>
                  <Field.Label>Client</Field.Label>
                  <select
                    className="chakra-select"
                    value={watch("clientId")}
                    onChange={(e) => setValue("clientId", e.target.value)}
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
                    <option value="">Select a client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                  {errors.clientId && (
                    <Field.ErrorText>{errors.clientId.message}</Field.ErrorText>
                  )}
                </Field.Root>

                <SimpleGrid columns={2} gap="4">
                  <Input
                    {...register("issueDate")}
                    type="date"
                    label="Issue Date"
                    error={errors.issueDate?.message}
                  />
                  <Input
                    {...register("dueDate")}
                    type="date"
                    label="Due Date"
                    error={errors.dueDate?.message}
                  />
                </SimpleGrid>

                <Field.Root>
                  <Field.Label>Currency</Field.Label>
                  <select
                    className="chakra-select"
                    value={watch("currency") || "ZAR"}
                    onChange={(e) => setValue("currency", e.target.value)}
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
                    <option value="ZAR">ZAR (South African Rand)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                  </select>
                </Field.Root>
              </SimpleGrid>

              {/* Invoice Items */}
              <VStack gap="3" mb="6">
                <Flex justify="space-between" align="center">
                  <Text fontWeight="semibold">Invoice Items</Text>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={<Icon as={Plus} boxSize="4" />}
                    onClick={() =>
                      append({ description: "", quantity: 1, unitPrice: 0, total: 0 })
                    }
                  >
                    Add Item
                  </Button>
                </Flex>

                <VStack gap="3">
                  {fields.map((field, index) => (
                    <HStack key={field.id} gap="3" align="start">
                      <Input
                        {...register(`items.${index}.description` as const)}
                        placeholder="Description"
                        flex="2"
                      />
                      <Input
                        {...register(`items.${index}.quantity` as const, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        placeholder="Qty"
                        width="20"
                      />
                      <Input
                        {...register(`items.${index}.unitPrice` as const, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        placeholder="Price"
                        width="20"
                      />
                      <Box
                        minW="24"
                        py="2.5"
                        px="3"
                        bg="bg.subtle"
                        borderRadius="md"
                        textAlign="right"
                      >
                        {formatCurrency(
                          (items[index]?.quantity || 0) *
                            (items[index]?.unitPrice || 0) *
                            100
                        )}
                      </Box>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        colorScheme="red"
                        onClick={() => remove(index)}
                        p="2"
                      >
                        <Icon as={Trash2} boxSize="4" color="error.500" />
                      </Button>
                    </HStack>
                  ))}
                </VStack>
              </VStack>

              {/* Totals */}
              <SimpleGrid columns={3} gap="4" mb="6">
                <Card variant="subtle">
                  <CardContent>
                    <Text fontSize="sm" color="fg.muted">
                      Subtotal
                    </Text>
                    <Text fontSize="lg" fontWeight="semibold">
                      {formatCurrency(subtotal * 100)}
                    </Text>
                  </CardContent>
                </Card>
                <Card variant="subtle">
                  <CardContent>
                    <Text fontSize="sm" color="fg.muted">
                      VAT (15%)
                    </Text>
                    <Text fontSize="lg" fontWeight="semibold">
                      {formatCurrency(vatAmount * 100)}
                    </Text>
                  </CardContent>
                </Card>
                <Card variant="subtle" bg="navy.50">
                  <CardContent>
                    <Text fontSize="sm" color="navy.700">
                      Total
                    </Text>
                    <Text fontSize="lg" fontWeight="semibold" color="navy.700">
                      {formatCurrency(total * 100)}
                    </Text>
                  </CardContent>
                </Card>
              </SimpleGrid>

              <Field.Root mb="6">
                <Field.Label>Notes</Field.Label>
                <Textarea
                  {...register("notes")}
                  rows={3}
                  placeholder="Additional notes for the invoice"
                />
              </Field.Root>

              <HStack gap="3">
                <Button type="submit" variant="primary">
                  {editingInvoice ? "Update Invoice" : "Create Invoice"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </HStack>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Invoices List */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
        {invoices.length === 0 ? (
          <Box
            gridColumn={{ base: "1 / -1", md: "1 / -1", lg: "1 / -1" }}
            py="12"
            textAlign="center"
          >
            <Text color="fg.muted">No invoices found. Create your first invoice!</Text>
          </Box>
        ) : (
          invoices.map((invoice) => {
            const isOverdue =
              invoice.status !== "paid" &&
              new Date(invoice.dueDate) < new Date();
            return (
              <Card key={invoice.id} variant="outlined">
                <CardContent>
                  <Flex justify="space-between" align="start" mb="3">
                    <VStack gap="1" align="start">
                      <Text fontWeight="semibold" color="fg">
                        {invoice.invoiceNumber}
                      </Text>
                      <Text fontSize="sm" color="fg.muted">
                        {invoice.client.name}
                      </Text>
                    </VStack>
                    <Badge
                      colorScheme={getStatusColor(invoice.status)}
                      variant="subtle"
                    >
                      {invoice.status}
                    </Badge>
                  </Flex>

                  <VStack gap="2" align="start" mb="4">
                    <HStack gap="2">
                      <Text fontSize="sm" color="fg.subtle">
                        Issued:
                      </Text>
                      <Text fontSize="sm" color="fg">
                        {formatDate(invoice.issueDate)}
                      </Text>
                    </HStack>
                    <HStack gap="2">
                      <Text fontSize="sm" color="fg.subtle">
                        Due:
                      </Text>
                      <Text
                        fontSize="sm"
                        color={isOverdue ? "error.600" : "fg"}
                        fontWeight={isOverdue ? "semibold" : undefined}
                      >
                        {formatDate(invoice.dueDate)}
                      </Text>
                    </HStack>
                  </VStack>

                  <Flex justify="space-between" align="center" mb="4">
                    <Text fontSize="sm" color="fg.muted">
                      Total Amount
                    </Text>
                    <Text fontSize="xl" fontWeight="bold" color="fg">
                      {formatCurrency(invoice.total)}
                    </Text>
                  </Flex>

                  <HStack gap="2">
                    <Button
                      variant="outline"
                      size="sm"
                      flex="1"
                      leftIcon={<Icon as={Edit} boxSize="4" />}
                      onClick={() => handleEdit(invoice)}
                    >
                      Edit
                    </Button>
                    {invoice.status !== "paid" && (
                      <Button
                        variant="success"
                        size="sm"
                        flex="1"
                        leftIcon={<Icon as={CheckCircle} boxSize="4" />}
                        onClick={() => handleMarkAsPaid(invoice.id)}
                      >
                        Mark Paid
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      colorScheme="red"
                      leftIcon={<Icon as={Trash2} boxSize="4" />}
                      onClick={() => handleDelete(invoice.id)}
                    >
                      Delete
                    </Button>
                  </HStack>
                </CardContent>
              </Card>
            );
          })
        )}
      </SimpleGrid>
    </VStack>
  );
};

export default Invoices;
