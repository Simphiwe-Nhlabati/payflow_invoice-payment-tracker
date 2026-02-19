"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { loginSchema } from "../../types/schemas";
import type { LoginCredentials } from "../../types/models";
import { authApi } from "../api";
import type { AxiosError } from "axios";
import {
  Box,
  Flex,
  VStack,
  Text,
  Heading,
  Icon,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Card, CardContent, Button, Input } from "../components/ui";

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginCredentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.login(data);
      const { user, accessToken, refreshToken } = response.data.data;

      login({ user, accessToken, refreshToken: refreshToken || "" });

      navigate("/dashboard");
    } catch (err: unknown) {
      console.error("Login error:", err);

      const axiosError = err as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        "An error occurred during login";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg="bg"
      px="4"
      py="12"
      position="relative"
      overflow="hidden"
      w="full"
    >
      <Box position="relative" w="full" maxW="md">
        {/* Decorative background elements */}
        <Box
          position="absolute"
          top="-20"
          right="-20"
          w="40"
          h="40"
          bg="amber.100"
          borderRadius="full"
          opacity="0.5"
          zIndex="0"
        />
        <Box
          position="absolute"
          bottom="-30"
          left="-30"
          w="60"
          h="60"
          bg="navy.100"
          borderRadius="full"
          opacity="0.3"
          zIndex="0"
        />

        <Card variant="elevated" position="relative" zIndex="1">
          <CardContent px="8" py="10">
            <VStack gap="2" mb="8" align="center" textAlign="center">
              <Box
                w="16"
                h="16"
                borderRadius="2xl"
                bg="navy.700"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb="2"
              >
                <Text fontSize="2xl" fontWeight="bold" color="white">
                  P
                </Text>
              </Box>
              <Heading size="xl" fontFamily="heading" color="fg">
                Welcome to PayFlow
              </Heading>
              <Text color="fg.muted">
                Sign in to your South African business account
              </Text>
            </VStack>

            <form onSubmit={handleSubmit(onSubmit)}>
              <VStack gap="6">
                {error && (
                  <Card
                    variant="subtle"
                    bg="error.50"
                    border="1px solid"
                    borderColor="error.200"
                    w="full"
                  >
                    <CardContent py="3">
                      <Flex gap="2" align="center">
                        <Box w="2" h="2" borderRadius="full" bg="error.500" />
                        <Text fontSize="sm" color="error.700" fontWeight="medium">
                          {error}
                        </Text>
                      </Flex>
                    </CardContent>
                  </Card>
                )}

                <Input
                  {...register("email")}
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  size="lg"
                  error={errors.email?.message}
                  rightElement={<Icon as={Mail} boxSize="5" color="fg.subtle" />}
                  autoComplete="email"
                  color="fg"
                />

                <Input
                  {...register("password")}
                  type="password"
                  label="Password"
                  placeholder="Enter your password"
                  size="lg"
                  error={errors.password?.message}
                  rightElement={<Icon as={Lock} boxSize="5" color="fg.subtle" />}
                  autoComplete="current-password"
                  color="fg"
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={loading}
                  w="full"
                  rightIcon={
                    !loading && <Icon as={ArrowRight} boxSize="4" />
                  }
                >
                  {loading ? "Signing in..." : "Sign in to PayFlow"}
                </Button>
              </VStack>
            </form>

            <Text textAlign="center" mt="6" fontSize="sm" color="fg.muted">
              Don't have an account?{" "}
              <ChakraLink
                href="/register"
                color="navy.700"
                fontWeight="semibold"
                _hover={{ color: "navy.800" }}
              >
                Sign up for free
              </ChakraLink>
            </Text>
          </CardContent>
        </Card>
      </Box>
    </Flex>
  );
};

export default Login;
