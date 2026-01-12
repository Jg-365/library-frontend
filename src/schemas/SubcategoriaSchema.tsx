import { z } from "zod";

/**
 * Schema de validação para formulário de Subcategoria
 * Código da subcategoria é auto-gerado pelo backend
 */
export const subcategoriaFormSchema = z.object({
  description: z
    .string()
    .min(3, "Descrição deve ter no mínimo 3 caracteres")
    .max(
      100,
      "Descrição deve ter no máximo 100 caracteres"
    ),
  categoryCode: z
    .number()
    .min(1, "Categoria principal é obrigatória"),
});

export type SubcategoriaFormValues = z.infer<
  typeof subcategoriaFormSchema
>;



