import { z } from "zod";

/**
 * Schema de validação para login
 */
export const loginSchema = z.object({
  username: z
    .string()
    .min(2, "Usuário deve ter no mínimo 2 caracteres"),
  password: z
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;



