import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  usuarioFormSchema,
  type UsuarioFormData,
} from "@/schemas/UsuarioSchema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "@/services/api";
import { API_ENDPOINTS } from "@/config/constants";
import type { Usuario } from "@/types";

interface Curso {
  courseCode: number;
  courseName: string;
}

interface UsuarioFormProps {
  usuario?: Usuario & { ativo?: boolean };
  onSuccess?: () => void;
}

export function UsuarioForm({
  usuario,
  onSuccess,
}: UsuarioFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [isLoadingCursos, setIsLoadingCursos] =
    useState(true);
  const isEditing = !!usuario;

  const form = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioFormSchema),
    defaultValues: {
      nome: usuario?.nome || usuario?.name || "",
      email: usuario?.email || usuario?.username || "",
      endereco: usuario?.address || "",
      tipoUsuario: usuario?.userType || "ALUNO",
      tipoAcesso: usuario?.role || "USUARIO",
      senha: "",
      codigoCurso: undefined,
      dataIngresso: "",
      dataFormatura: "",
      dataContratacao: "",
      regimeTrabalho: undefined,
      ativo: usuario?.ativo ?? usuario?.active ?? true,
    },
  });

  const tipoUsuarioSelecionado = form.watch("tipoUsuario");

  // Busca cursos ao montar o componente
  useEffect(() => {
    const fetchCursos = async () => {
      try {
        setIsLoadingCursos(true);
        const response = await api.get<Curso[]>(
          API_ENDPOINTS.CURSOS.BASE
        );
        setCursos(response.data || []);
      } catch (error) {
        console.error("Erro ao buscar cursos:", error);
        toast.error("Erro ao carregar lista de cursos");
        setCursos([]);
      } finally {
        setIsLoadingCursos(false);
      }
    };
    fetchCursos();
  }, []);

  const onSubmit = async (data: UsuarioFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        // Se está editando e não forneceu senha, remove do payload
        const payload = data.senha
          ? data
          : { ...data, senha: undefined };

        // Backend usa enrollment no path, determinar tipo de usuário
        const enrollment = usuario.enrollment || usuario.id;
        const userType = usuario.userType;

        // Escolher endpoint correto baseado no tipo de usuário
        let updateEndpoint;
        if (userType === "ALUNO") {
          updateEndpoint =
            API_ENDPOINTS.USUARIOS.UPDATE_STUDENT(
              enrollment?.toString() || ""
            );
        } else if (userType === "PROFESSOR") {
          updateEndpoint =
            API_ENDPOINTS.USUARIOS.UPDATE_TEACHER(
              enrollment?.toString() || ""
            );
        } else {
          updateEndpoint =
            API_ENDPOINTS.USUARIOS.UPDATE_EMPLOYEE(
              enrollment?.toString() || ""
            );
        }

        await api.patch(updateEndpoint, payload);
        toast.success("Usuário atualizado com sucesso!");
      } else {
        // Mapear dados do formulário para o formato que o backend espera
        const backendPayload: any = {
          password: data.senha,
          name: data.nome,
          username:
            data.email?.split("@")[0] ||
            data.nome?.toLowerCase().replace(/\s/g, ""),
          address: data.endereco,
          userType: data.tipoUsuario,
          role: data.tipoAcesso,
        };

        // Adicionar campos específicos baseados no tipo de usuário
        if (data.tipoUsuario === "ALUNO") {
          // courseCode opcional (pode ser null no banco se permitido)
          if (data.codigoCurso && data.codigoCurso > 0) {
            backendPayload.courseCode = data.codigoCurso;
          }
          // Campos obrigatórios para ALUNO (validação garante que existem)
          backendPayload.ingressDate = data.dataIngresso;
          backendPayload.graduationDate =
            data.dataFormatura;
        } else if (data.tipoUsuario === "PROFESSOR") {
          // courseCode opcional (pode ser null no banco se permitido)
          if (data.codigoCurso && data.codigoCurso > 0) {
            backendPayload.courseCode = data.codigoCurso;
          }
          // Campos obrigatórios para PROFESSOR (validação garante que existem)
          backendPayload.hireDate = data.dataContratacao;
          backendPayload.workRegime = data.regimeTrabalho;
        }
        // FUNCIONARIO não precisa de campos adicionais

        await api.post(
          API_ENDPOINTS.USUARIOS.CREATE,
          backendPayload
        );
        toast.success("Usuário cadastrado com sucesso!");
        form.reset();
      }
      onSuccess?.();
    } catch (error: any) {
      // Extrai mensagem de erro detalhada
      let message = "Erro ao salvar usuário";

      if (error.response?.data?.message) {
        message = error.response.data.message;

        // Detecta erro de foreign key para código de curso
        if (
          message.includes("foreign key constraint") ||
          message.includes("cod_curso") ||
          message.includes("courseCode")
        ) {
          message =
            "Código do curso inválido! O curso informado não existe no sistema. Deixe em branco ou use um código válido.";
        }

        // Detecta username duplicado
        if (
          message.includes("Duplicate entry") ||
          message.includes("username") ||
          message.includes("constraint [usuario.username]")
        ) {
          message =
            "Este nome de usuário (username) já está em uso! Por favor, escolha outro.";
        }
      } else if (
        error.response?.data?.errors?.[0]?.message
      ) {
        message = error.response.data.errors[0].message;
      }

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite o nome completo"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="usuario@email.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endereco"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço</FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite o endereço completo"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tipoUsuario"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Usuário</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
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
          name="tipoAcesso"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Nível de Acesso no Sistema
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="USUARIO">
                    Usuário (acesso básico)
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

        {/* Campos específicos para ALUNO */}
        {tipoUsuarioSelecionado === "ALUNO" && (
          <>
            <FormField
              control={form.control}
              name="codigoCurso"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Curso *</FormLabel>
                  {isLoadingCursos ? (
                    <div className="text-sm text-muted-foreground py-2">
                      Carregando cursos...
                    </div>
                  ) : cursos.length === 0 ? (
                    <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                      <p className="text-sm text-amber-800 font-medium">
                        ⚠️ Nenhum curso cadastrado
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        Cadastre um curso antes de criar
                        alunos
                      </p>
                    </div>
                  ) : (
                    <Select
                      onValueChange={(value) =>
                        field.onChange(parseInt(value))
                      }
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o curso" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cursos.map((curso) => (
                          <SelectItem
                            key={curso.courseCode}
                            value={curso.courseCode.toString()}
                          >
                            {curso.courseName} (Cód.{" "}
                            {curso.courseCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dataIngresso"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Ingresso *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dataFormatura"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Data de Formatura Prevista *
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* Campos específicos para PROFESSOR */}
        {tipoUsuarioSelecionado === "PROFESSOR" && (
          <>
            <FormField
              control={form.control}
              name="codigoCurso"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Curso (opcional)</FormLabel>
                  {isLoadingCursos ? (
                    <div className="text-sm text-muted-foreground py-2">
                      Carregando cursos...
                    </div>
                  ) : cursos.length === 0 ? (
                    <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                      <p className="text-sm text-amber-800 font-medium">
                        ⚠️ Nenhum curso cadastrado
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        Deixe em branco ou cadastre cursos
                        no sistema
                      </p>
                    </div>
                  ) : (
                    <Select
                      onValueChange={(value) =>
                        field.onChange(
                          value
                            ? parseInt(value)
                            : undefined
                        )
                      }
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o curso (opcional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">
                          Nenhum
                        </SelectItem>
                        {cursos.map((curso) => (
                          <SelectItem
                            key={curso.courseCode}
                            value={curso.courseCode.toString()}
                          >
                            {curso.courseName} (Cód.{" "}
                            {curso.courseCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dataContratacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Data de Contratação *
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="regimeTrabalho"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Regime de Trabalho *
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o regime" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DE">
                        Dedicação Exclusiva
                      </SelectItem>
                      <SelectItem value="INTEGRAL">
                        Integral
                      </SelectItem>
                      <SelectItem value="PARCIAL">
                        Parcial
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="senha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {isEditing
                  ? "Nova Senha (deixe em branco para manter a atual)"
                  : "Senha"}
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={
                    isEditing
                      ? "Digite apenas se quiser alterar"
                      : "Digite a senha"
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ativo"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Usuário Ativo</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Desmarque para desativar o acesso deste
                  usuário
                </p>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isSubmitting
              ? "Salvando..."
              : isEditing
              ? "Atualizar Usuário"
              : "Cadastrar Usuário"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
