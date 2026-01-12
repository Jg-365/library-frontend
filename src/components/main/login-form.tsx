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
  Lock,
  User,
  AlertCircle,
  Globe,
  Scale,
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
        const perfil =
          (user.role ?? user.perfil ?? "USUARIO") as Perfil;

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
    <div className="min-h-screen w-full flex items-center justify-center cyber-atlas-surface relative p-4 sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.08),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_55%)]" />
      <div className="relative w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Logo/Header */}
        <div className="text-center space-y-2">
          <div className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-500 shadow-xl mb-4">
            <Globe className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            <span className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-900 shadow-md dark:bg-slate-900 dark:text-slate-100">
              <Scale className="h-4 w-4" />
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
            Cyber Atlas
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-slate-300">
            Democracia digital do conhecimento
          </p>
        </div>

        {/* Login Card */}
        <Card className="border border-white/60 shadow-2xl backdrop-blur-sm bg-white/80 dark:border-slate-800/80 dark:bg-slate-900/70 dark:text-slate-100">
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
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                          <Input
                            placeholder="Digite seu email ou usuário"
                            disabled={isLoading}
                            className="pl-10 h-11 text-sm sm:text-base transition-all duration-200 focus:ring-2 focus:ring-sky-500"
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
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                          <Input
                            type="password"
                            placeholder="Digite sua senha"
                            disabled={isLoading}
                            className="pl-10 h-11 text-sm sm:text-base transition-all duration-200 focus:ring-2 focus:ring-sky-500"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <Button
                  className="w-full h-11 sm:h-12 bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 hover:from-sky-600 hover:via-cyan-600 hover:to-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
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



