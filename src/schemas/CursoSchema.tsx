import { z } from "zod";

export const cursoFormSchema = z.object({
  courseName: z
    .string()
    .min(
      3,
      "O nome do curso deve ter no mínimo 3 caracteres"
    )
    .max(
      75,
      "O nome do curso deve ter no máximo 75 caracteres"
    ),
});

export type CursoFormData = z.infer<typeof cursoFormSchema>;



