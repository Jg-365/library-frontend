"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui";
import { useNavigate } from "react-router-dom";
import { useAuth as useAuthContext } from "@/store/AuthContext";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { getErrorMessage } from "@/lib/errorMessage";
import {
  loginSchema,
  type LoginFormValues,
} from "@/schemas";
import { PERFIL_ROUTES } from "@/config";
import type { Perfil } from "@/types";
import {
  BookOpen,
  Lock,
  User,
  AlertCircle,
} from "lucide-react";

export function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Limpa qualquer sessão antiga ao carregar o componente
  useState(() => {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("user-data");
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setError("");
    setIsLoading(true);

    try {
      await login(values.username, values.password);

      // Pega o usuário do localStorage
      const userData = localStorage.getItem("user-data");
      if (userData) {
        const user = JSON.parse(userData);
        const perfil = user.perfil as Perfil;

        console.log("🔐 Login bem-sucedido:", {
          perfil,
          rotaDisponivel: PERFIL_ROUTES[perfil],
          perfilRoutes: PERFIL_ROUTES,
        });

        // Redireciona baseado no perfil usando constantes
        const route =
          PERFIL_ROUTES[
            perfil as keyof typeof PERFIL_ROUTES
          ] || "/usuario";
        navigate(route);
      }
    } catch (err: any) {
      setError(
        getErrorMessage(
          err.response?.data?.message || err.message,
          "Erro ao fazer login"
        )
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Logo/Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg mb-4">
            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Biblioteca Virtual
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Acesse sua conta para continuar
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/80">
          <CardContent className="space-y-4">
            {/* Error Alert */}
            {error && (
              <Alert
                variant="destructive"
                className="animate-in slide-in-from-top-2"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs sm:text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Email ou Nome de Usuário
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Digite seu email ou usuário"
                            disabled={isLoading}
                            className="pl-10 h-11 text-sm sm:text-base transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Senha
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="password"
                            placeholder="Digite sua senha"
                            disabled={isLoading}
                            className="pl-10 h-11 text-sm sm:text-base transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <Button
                  className="w-full h-11 sm:h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Entrando...
                    </span>
                  ) : (
                    "Entrar no Sistema"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs sm:text-sm text-gray-500">
          © 2025 Sistema de Biblioteca. Todos os direitos
          reservados.
        </p>
      </div>
    </div>
  );
}
