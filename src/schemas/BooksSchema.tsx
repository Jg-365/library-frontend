import { z } from "zod";
import type { Livro } from "@/types";
import { autorSchema } from "./AutorSchema";

/**
 * Schema de validação para o tipo Livro (response da API)
 */
export const BooksSchema = z.object({
  id: z.number(),
  isbn: z.string(),
  titulo: z.string(),
  ano: z.number(),
  editora: z.string(),
  imagemCapa: z.string().optional(),
  categoriaId: z.number(),
  subcategoriaId: z.number().optional(),
  autores: z.array(autorSchema),
  quantidadeExemplares: z.number(),
}) satisfies z.ZodType<Livro>;

/**
 * Schema de validação para formulário de Livro
 */
export const livroFormSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  isbn: z
    .string()
    .min(10, "ISBN deve ter no mínimo 10 caracteres"),
  editora: z.string().min(1, "Editora é obrigatória"),
  ano: z
    .number()
    .min(1000)
    .max(new Date().getFullYear() + 1),
  categoriaId: z.number().min(1, "Categoria é obrigatória"),
  subcategoriaId: z
    .number()
    .min(1, "Subcategoria é obrigatória"),
  autores: z
    .array(z.number())
    .min(1, "Selecione pelo menos um autor"),
});

export type LivroFormValues = z.infer<
  typeof livroFormSchema
>;

// Schema para array de livros
export const livrosArraySchema = z.array(BooksSchema);

export default BooksSchema;



