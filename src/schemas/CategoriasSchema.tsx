import { z } from "zod";
import type { Categoria } from "@/types";

/**
 * Schema de validação para o tipo Categoria (response da API)
 */
export const categoriaSchema = z.object({
  categoryCode: z.number(),
  description: z.string(),
}) satisfies z.ZodType<Categoria>;

/**
 * Schema de validação para formulário de Categoria
 */
export const categoriaFormSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
});

export type CategoriaFormValues = z.infer<
  typeof categoriaFormSchema
>;

export default categoriaSchema;
