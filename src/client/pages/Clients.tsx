"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema } from "../../types/schemas";
import type { CreateClientData, Client } from "../api";
import { clientApi } from "../api";
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
  Textarea,
  Field,
} from "@chakra-ui/react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  Plus,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from "../components/ui";

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateClientData>({
    resolver: zodResolver(clientSchema),
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await clientApi.getAll(
          searchTerm ? { search: searchTerm } : undefined
        );
        setClients(response.data.data.clients);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch clients");
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [searchTerm]);

  const onSubmit = async (data: CreateClientData) => {
    try {
      if (editingClient) {
        const response = await clientApi.update(editingClient.id, data);
        setClients(
          clients.map((c) =>
            c.id === editingClient.id ? response.data.data.client : c
          )
        );
        setEditingClient(null);
      } else {
        const response = await clientApi.create(data);
        setClients([...clients, response.data.data.client]);
      }

      reset();
      setShowForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setShowForm(true);
    setValue("name", client.name);
    setValue("email", client.email);
    setValue("phone", client.phone || "");
    setValue("address", client.address || "");
    setValue("vatNumber", client.vatNumber || "");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await clientApi.delete(id);
        setClients(clients.filter((client) => client.id !== id));
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to delete client");
      }
    }
  };

  const handleCancel = () => {
    setEditingClient(null);
    reset();
    setShowForm(false);
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
          Clients
        </Heading>
        <Button
          variant="primary"
          leftIcon={<Icon as={Plus} boxSize="4" />}
          onClick={() => {
            setEditingClient(null);
            reset();
            setShowForm(true);
          }}
        >
          Add Client
        </Button>
      </Flex>

      {/* Search */}
      <Input
        type="text"
        placeholder="Search clients..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        size="lg"
        leftElement={<Icon as={Search} boxSize="5" color="fg.subtle" />}
      />

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

      {/* Client Form */}
      {showForm && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>
              {editingClient ? "Edit Client" : "Add New Client"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap="4" mb="4">
                <Input
                  {...register("name")}
                  label="Name"
                  placeholder="Client name"
                  error={errors.name?.message}
                />

                <Input
                  {...register("email")}
                  type="email"
                  label="Email"
                  placeholder="client@example.com"
                  error={errors.email?.message}
                  leftElement={<Icon as={Mail} boxSize="5" color="fg.subtle" />}
                />

                <Input
                  {...register("phone")}
                  type="tel"
                  label="Phone"
                  placeholder="(123) 456-7890"
                  error={errors.phone?.message}
                  leftElement={<Icon as={Phone} boxSize="5" color="fg.subtle" />}
                />

                <Input
                  {...register("vatNumber")}
                  label="VAT Number"
                  placeholder="ZA1234567890"
                  error={errors.vatNumber?.message}
                />
              </SimpleGrid>

              <Field.Root mb="4">
                <Field.Label>Address</Field.Label>
                <Textarea
                  {...register("address")}
                  rows={3}
                  placeholder="Client address"
                  borderColor={errors.address ? "error.300" : undefined}
                />
                {errors.address && (
                  <Field.ErrorText>{errors.address.message}</Field.ErrorText>
                )}
              </Field.Root>

              <HStack gap="3">
                <Button
                  type="submit"
                  variant="primary"
                >
                  {editingClient ? "Update Client" : "Add Client"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </HStack>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Clients List */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
        {clients.length === 0 ? (
          <Box
            gridColumn={{ base: "1 / -1", md: "1 / -1", lg: "1 / -1" }}
            py="12"
            textAlign="center"
          >
            <Text color="fg.muted">No clients found. Add your first client!</Text>
          </Box>
        ) : (
          clients.map((client) => (
            <Card key={client.id} variant="outlined">
              <CardContent>
                <Flex justify="space-between" align="start" mb="3">
                  <VStack gap="1" align="start">
                    <HStack gap="2">
                      <Box
                        w="8"
                        h="8"
                        borderRadius="full"
                        bg="navy.100"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={User} boxSize="4" color="navy.600" />
                      </Box>
                      <Text fontWeight="semibold" color="fg">
                        {client.name}
                      </Text>
                    </HStack>
                    <Badge colorScheme="success" variant="subtle">
                      Active
                    </Badge>
                  </VStack>
                </Flex>

                <VStack gap="2" align="start" mb="4">
                  <HStack gap="2">
                    <Icon as={Mail} boxSize="4" color="fg.subtle" />
                    <Text fontSize="sm" color="fg.muted">
                      {client.email}
                    </Text>
                  </HStack>
                  {client.phone && (
                    <HStack gap="2">
                      <Icon as={Phone} boxSize="4" color="fg.subtle" />
                      <Text fontSize="sm" color="fg.muted">
                        {client.phone}
                      </Text>
                    </HStack>
                  )}
                  {client.address && (
                    <HStack gap="2" align="start">
                      <Icon as={MapPin} boxSize="4" color="fg.subtle" />
                      <Text fontSize="sm" color="fg.muted">
                        {client.address}
                      </Text>
                    </HStack>
                  )}
                </VStack>

                <HStack gap="2">
                  <Button
                    variant="outline"
                    size="sm"
                    flex="1"
                    leftIcon={<Icon as={Edit} boxSize="4" />}
                    onClick={() => handleEdit(client)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    flex="1"
                    leftIcon={<Icon as={Trash2} boxSize="4" />}
                    onClick={() => handleDelete(client.id)}
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

export default Clients;
