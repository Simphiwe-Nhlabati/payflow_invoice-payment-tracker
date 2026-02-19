"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema } from "../../types/schemas";
import type { UpdateProfileData } from "../api";
import { authApi } from "../api";
import { useAuth } from "../context/AuthContext";
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
  Separator,
} from "@chakra-ui/react";
import { User, Mail, Building, Calendar, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from "../components/ui";

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const {
    state: { user: currentUser },
    updateUser,
  } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<UpdateProfileData>({
    resolver: zodResolver(updateProfileSchema),
  });

  useEffect(() => {
    if (currentUser) {
      setValue("firstName", currentUser.firstName);
      setValue("lastName", currentUser.lastName);
      setValue("businessName", currentUser.businessName || "");
      setLoading(false);
    }
  }, [currentUser, setValue]);

  const onSubmit = async (data: UpdateProfileData) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authApi.updateProfile(data);
      const updatedUser = response.data.data.user;

      updateUser(updatedUser);
      setSuccess("Profile updated successfully!");

      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      console.error("Profile update error:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
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
    <VStack gap="6" align="stretch" maxW="4xl">
      {/* Header */}
      <VStack gap="1" align="start">
        <Heading size="lg" fontFamily="heading">
          Account Settings
        </Heading>
        <Text color="fg.muted">
          Manage your account settings and preferences.
        </Text>
      </VStack>

      {/* Profile Information */}
      <Card variant="elevated">
        <CardHeader>
          <HStack gap="3">
            <Box
              w="10"
              h="10"
              borderRadius="lg"
              bg="navy.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={User} boxSize="5" color="navy.600" />
            </Box>
            <VStack gap="0" align="start">
              <CardTitle>Profile Information</CardTitle>
              <Text fontSize="sm" color="fg.muted">
                Update your personal details
              </Text>
            </VStack>
          </HStack>
        </CardHeader>
        <CardContent>
          {error && (
            <Box
              mb="4"
              p="4"
              bg="error.50"
              border="1px solid"
              borderColor="error.200"
              borderRadius="md"
            >
              <HStack gap="2">
                <Box w="2" h="2" borderRadius="full" bg="error.500" />
                <Text fontSize="sm" color="error.700" fontWeight="medium">
                  {error}
                </Text>
              </HStack>
            </Box>
          )}

          {success && (
            <Box
              mb="4"
              p="4"
              bg="success.50"
              border="1px solid"
              borderColor="success.200"
              borderRadius="md"
            >
              <HStack gap="2">
                <Box w="2" h="2" borderRadius="full" bg="success.500" />
                <Text fontSize="sm" color="success.700" fontWeight="medium">
                  {success}
                </Text>
              </HStack>
            </Box>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap="4" mb="6">
              <Input
                {...register("firstName")}
                label="First Name"
                placeholder="John"
                error={errors.firstName?.message}
              />

              <Input
                {...register("lastName")}
                label="Last Name"
                placeholder="Doe"
                error={errors.lastName?.message}
              />

              <Input
                {...register("businessName")}
                label="Business Name"
                placeholder="Your business name"
                error={errors.businessName?.message}
                leftElement={
                  <Icon as={Building} boxSize="5" color="fg.subtle" />
                }
              />

              <Input
                label="Email Address"
                value={currentUser?.email || ""}
                disabled
                helperText="Email cannot be changed"
                leftElement={<Icon as={Mail} boxSize="5" color="fg.subtle" />}
              />
            </SimpleGrid>

            <Button type="submit" variant="primary" isLoading={saving}>
              {saving ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card variant="elevated">
        <CardHeader>
          <HStack gap="3">
            <Box
              w="10"
              h="10"
              borderRadius="lg"
              bg="amber.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={Shield} boxSize="5" color="amber.600" />
            </Box>
            <VStack gap="0" align="start">
              <CardTitle>Account Information</CardTitle>
              <Text fontSize="sm" color="fg.muted">
                Details about your account
              </Text>
            </VStack>
          </HStack>
        </CardHeader>
        <CardContent>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="6">
            <VStack gap="1" align="start">
              <HStack gap="2">
                <Icon as={Calendar} boxSize="4" color="fg.subtle" />
                <Text fontSize="sm" fontWeight="medium" color="fg">
                  Member Since
                </Text>
              </HStack>
              <Text fontSize="md" color="fg.muted" ml="6">
                {currentUser?.createdAt
                  ? new Date(currentUser.createdAt).toLocaleDateString("en-ZA", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "N/A"}
              </Text>
            </VStack>

            <VStack gap="1" align="start">
              <HStack gap="2">
                <Icon as={Shield} boxSize="4" color="fg.subtle" />
                <Text fontSize="sm" fontWeight="medium" color="fg">
                  User ID
                </Text>
              </HStack>
              <Text fontSize="md" color="fg.muted" ml="6" fontFamily="mono">
                {currentUser?.id || "N/A"}
              </Text>
            </VStack>

            <VStack gap="1" align="start">
              <HStack gap="2">
                <Icon as={Mail} boxSize="4" color="fg.subtle" />
                <Text fontSize="sm" fontWeight="medium" color="fg">
                  Email Address
                </Text>
              </HStack>
              <Text fontSize="md" color="fg.muted" ml="6">
                {currentUser?.email || "N/A"}
              </Text>
            </VStack>

            <VStack gap="1" align="start">
              <HStack gap="2">
                <Icon as={User} boxSize="4" color="fg.subtle" />
                <Text fontSize="sm" fontWeight="medium" color="fg">
                  Full Name
                </Text>
              </HStack>
              <Text fontSize="md" color="fg.muted" ml="6">
                {currentUser?.firstName} {currentUser?.lastName}
              </Text>
            </VStack>
          </SimpleGrid>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card variant="outlined">
        <CardContent>
          <VStack gap="4" alignItems="start">
            <VStack gap="1" alignItems="start">
              <Text fontWeight="semibold" color="fg">
                Security
              </Text>
              <Text fontSize="sm" color="fg.muted">
                Manage your password and security settings
              </Text>
            </VStack>
            <Separator />
            <Button variant="outline" size="md">
              Change Password
            </Button>
          </VStack>
        </CardContent>
      </Card>
    </VStack>
  );
};

export default Settings;
