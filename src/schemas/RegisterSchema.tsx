import { z } from "zod";

/**
 * Schema de validação para registro de usuário
 */
export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(2, "Usuário deve ter no mínimo 2 caracteres")
      .max(50, "Usuário deve ter no máximo 50 caracteres"),
    password: z
      .string()
      .min(6, "Senha deve ter no mínimo 6 caracteres")
      .max(50, "Senha deve ter no máximo 50 caracteres"),
    name: z
      .string()
      .trim()
      .min(2, "Nome deve ter no mínimo 2 caracteres")
      .max(100, "Nome deve ter no máximo 100 caracteres"),
    address: z
      .string()
      .trim()
      .min(1, "Endereço é obrigatório"),
    userType: z.enum(
      ["ALUNO", "PROFESSOR", "FUNCIONARIO"],
      {
        required_error: "Tipo de usuário é obrigatório",
      }
    ),
    role: z.enum(["ADMIN", "BIBLIOTECARIO", "USUARIO"], {
      required_error: "Perfil é obrigatório",
    }),
    // Campos condicionais para Alunos e Professores
    courseCode: z.number().int().optional(),
    ingressDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    graduationDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    // Campos condicionais para Professores
    hireDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    workRegime: z.enum(["20", "40", "DE"]).optional(),
  })
  .refine(
    (data) => {
      // Se é ALUNO ou PROFESSOR, courseCode é obrigatório
      if (
        (data.userType === "ALUNO" ||
          data.userType === "PROFESSOR") &&
        !data.courseCode
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        "Código do curso é obrigatório para Alunos e Professores",
      path: ["courseCode"],
    }
  )
  .refine(
    (data) => {
      // Se é ALUNO, ingressDate e graduationDate são obrigatórios
      if (
        data.userType === "ALUNO" &&
        (!data.ingressDate || !data.graduationDate)
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        "Data de ingresso e formatura são obrigatórias para Alunos",
      path: ["ingressDate"],
    }
  )
  .refine(
    (data) => {
      // Se é PROFESSOR, hireDate e workRegime são obrigatórios
      if (
        data.userType === "PROFESSOR" &&
        (!data.hireDate || !data.workRegime)
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        "Data de contratação e regime de trabalho são obrigatórios para Professores",
      path: ["hireDate"],
    }
  );

export type RegisterFormValues = z.infer<
  typeof registerSchema
>;



