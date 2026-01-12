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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/schemas/RegisterSchema";
import { authService } from "@/services/authService";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errorMessage";
import {
  User,
  Lock,
  Mail,
  Home,
  BookOpen,
  Calendar,
  Briefcase,
  AlertCircle,
  Globe,
  Scale,
} from "lucide-react";

export function RegisterForm() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      address: "",
      userType: undefined,
      role: "USUARIO",
    },
  });

  const userType = form.watch("userType");

  async function onSubmit(values: RegisterFormValues) {
    setError("");
    setIsLoading(true);

    try {
      await authService.register(values);
      toast.success("Cadastro realizado com sucesso!", {
        description: "Você já pode fazer login.",
      });
      navigate("/login");
    } catch (err: any) {
      const errorMsg = getErrorMessage(
        err.response?.data?.message || err.message,
        "Erro ao fazer cadastro"
      );
      setError(errorMsg);
      toast.error("Erro no cadastro", {
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center cyber-atlas-surface relative p-4 sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.08),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_55%)]" />
      <div className="relative w-full max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-500 text-white shadow-xl mb-4">
            <Globe className="w-8 h-8" />
            <span className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-900 shadow-md dark:bg-slate-900 dark:text-slate-100">
              <Scale className="h-4 w-4" />
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
            Cyber Atlas
          </h1>
          <p className="text-sm text-gray-600 dark:text-slate-300">
            Ative sua identidade na democracia digital
          </p>
        </div>

        <Card className="border border-white/60 shadow-2xl backdrop-blur-sm bg-white/80 dark:border-slate-800/80 dark:bg-slate-900/70">
          <CardContent className="p-6 sm:p-8">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Dados Básicos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                            <Input
                              placeholder="João Silva"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usuário</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                            <Input
                              placeholder="joao.silva"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                          <Input
                            type="password"
                            placeholder="••••••"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                          <Input
                            placeholder="Rua Exemplo, 123"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tipo de Usuário */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="userType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Tipo de Usuário
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ALUNO">
                              Aluno
                            </SelectItem>
                            <SelectItem value="PROFESSOR">
                              Professor
                            </SelectItem>
                            <SelectItem value="FUNCIONARIO">
                              Funcionário
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Perfil de Acesso
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USUARIO">
                              Usuário
                            </SelectItem>
                            <SelectItem value="BIBLIOTECARIO">
                              Bibliotecário
                            </SelectItem>
                            <SelectItem value="ADMIN">
                              Administrador
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Campos Condicionais - Aluno ou Professor */}
                {(userType === "ALUNO" ||
                  userType === "PROFESSOR") && (
                  <FormField
                    control={form.control}
                    name="courseCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Código do Curso
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                            <Input
                              type="number"
                              placeholder="101"
                              className="pl-10"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? parseInt(
                                        e.target.value
                                      )
                                    : undefined
                                )
                              }
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Campos Específicos - Aluno */}
                {userType === "ALUNO" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ingressDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Data de Ingresso
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                              <Input
                                type="date"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="graduationDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Data de Formatura
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                              <Input
                                type="date"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Campos Específicos - Professor */}
                {userType === "PROFESSOR" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="hireDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Data de Contratação
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                              <Input
                                type="date"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="workRegime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Regime de Trabalho
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <Briefcase className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="20">
                                20 horas
                              </SelectItem>
                              <SelectItem value="40">
                                40 horas
                              </SelectItem>
                              <SelectItem value="DE">
                                Dedicação Exclusiva
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 hover:from-sky-600 hover:via-cyan-600 hover:to-emerald-600"
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Cadastrando..."
                    : "Criar Conta"}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-gray-600 dark:text-slate-300">
                    Já tem uma conta?{" "}
                  </span>
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto font-semibold"
                    onClick={() => navigate("/login")}
                  >
                    Fazer login
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



