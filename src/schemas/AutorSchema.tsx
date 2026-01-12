import { z } from "zod";
import type { Autor } from "@/types";

/**
 * Schema de validação para o tipo Autor (response da API)
 */
export const autorSchema = z.object({
  id: z.number(),
  nome: z.string(),
  email: z.string().email(),
  nacionalidade: z.string(),
}) satisfies z.ZodType<Autor>;

/**
 * Schema de validação para formulário de Autor
 */
export const autorFormSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  nacionalidade: z
    .string()
    .min(1, "Nacionalidade é obrigatória"),
});

export type AutorFormValues = z.infer<
  typeof autorFormSchema
>;

export default autorSchema;



