import { z } from "zod";
import type { Categoria } from "@/types";

/**
 * Schema de validação para o tipo Categoria (response da API)
 */
export const categoriaSchema = z.object({
  id: z.number(),
  codigo: z.string(),
  descricao: z.string(),
}) satisfies z.ZodType<Categoria>;

/**
 * Schema de validação para formulário de Categoria
 */
export const categoriaFormSchema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória"),
});

export type CategoriaFormValues = z.infer<
  typeof categoriaFormSchema
>;

export default categoriaSchema;
