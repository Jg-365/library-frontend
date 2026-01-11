import { z } from "zod";

const telefoneSchema = z.object({
  numero: z
    .string()
    .min(10, "Telefone deve ter no mínimo 10 dígitos"),
  tipo: z
    .enum(["CELULAR", "RESIDENCIAL", "COMERCIAL"])
    .default("CELULAR"),
});

// Schema unificado com senha opcional (detecta se é criação ou edição)
export const usuarioFormSchema = z
  .object({
    nome: z
      .string()
      .min(3, "O nome deve ter no mínimo 3 caracteres")
      .max(100, "O nome deve ter no máximo 100 caracteres"),
    email: z
      .string()
      .email("E-mail inválido")
      .min(5, "O e-mail deve ter no mínimo 5 caracteres")
      .max(
        100,
        "O e-mail deve ter no máximo 100 caracteres"
      ),
    endereco: z
      .string()
      .min(5, "O endereço deve ter no mínimo 5 caracteres")
      .max(
        200,
        "O endereço deve ter no máximo 200 caracteres"
      ),

    // Separação de conceitos: Tipo de Usuário vs Tipo de Acesso
    tipoUsuario: z.enum(
      ["ALUNO", "PROFESSOR", "FUNCIONARIO"],
      {
        errorMap: () => ({
          message: "Selecione um tipo de usuário válido",
        }),
      }
    ),
    tipoAcesso: z.enum(
      ["ADMIN", "BIBLIOTECARIO", "USUARIO"],
      {
        errorMap: () => ({
          message: "Selecione um nível de acesso válido",
        }),
      }
    ),

    senha: z
      .string()
      .min(3, "A senha deve ter no mínimo 3 caracteres")
      .max(50, "A senha deve ter no máximo 50 caracteres")
      .optional()
      .or(z.literal("")),

    // Campos específicos - validação condicional aplicada no superRefine
    codigoCurso: z.number().optional(),
    dataIngresso: z.string().optional(),
    dataFormatura: z.string().optional(),
    dataContratacao: z.string().optional(),
    regimeTrabalho: z
      .enum(["DE", "INTEGRAL", "PARCIAL"])
      .optional(),

    ativo: z.boolean(),
  })
  .superRefine((data, ctx) => {
    // Validação condicional para ALUNO - campos obrigatórios no banco
    if (data.tipoUsuario === "ALUNO") {
      if (!data.dataIngresso || data.dataIngresso === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Data de ingresso é obrigatória para alunos",
          path: ["dataIngresso"],
        });
      }
      if (
        !data.dataFormatura ||
        data.dataFormatura === ""
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Data de formatura prevista é obrigatória para alunos",
          path: ["dataFormatura"],
        });
      }
    }

    // Validação condicional para PROFESSOR - campos obrigatórios no banco
    if (data.tipoUsuario === "PROFESSOR") {
      if (
        !data.dataContratacao ||
        data.dataContratacao === ""
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Data de contratação é obrigatória para professores",
          path: ["dataContratacao"],
        });
      }
      if (!data.regimeTrabalho) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Regime de trabalho é obrigatório para professores",
          path: ["regimeTrabalho"],
        });
      }
    }
  });

// Alias para compatibilidade (ambos usam o mesmo schema agora)
export const usuarioEditFormSchema = usuarioFormSchema;

export type UsuarioFormData = z.infer<
  typeof usuarioFormSchema
>;
export type TelefoneData = z.infer<typeof telefoneSchema>;
