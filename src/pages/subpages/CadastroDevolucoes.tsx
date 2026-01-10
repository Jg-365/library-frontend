import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layouts";
import { PageBreadcrumb } from "@/components/layouts/PageBreadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  BookOpen,
  CheckCircle,
  User,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { emprestimosService } from "@/services/emprestimosService";
import type { Emprestimo } from "@/types";

export function CadastroDevolucoes() {
  const [emprestimos, setEmprestimos] = useState<
    Emprestimo[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [emprestimoSelecionado, setEmprestimoSelecionado] =
    useState<Emprestimo | null>(null);

  const fetchEmprestimos = async () => {
    try {
      setIsLoading(true);
      const response =
        await emprestimosService.listarTodos();
      setEmprestimos(response);
    } catch (error: any) {
      toast.error("Erro ao carregar empréstimos");
      console.error("Erro ao buscar empréstimos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmprestimos();
  }, []);

  const handleDevolver = (emprestimo: Emprestimo) => {
    setEmprestimoSelecionado(emprestimo);
  };

  const confirmarDevolucao = async () => {
    if (!emprestimoSelecionado) return;

    try {
      // Extrair ISBNs — prefer `livros[].isbn`, fallback para `copyCodes` (formato isbn-seq)
      const isbnCodes: string[] = [];
      if (
        emprestimoSelecionado.livros &&
        emprestimoSelecionado.livros.length > 0
      ) {
        for (const l of emprestimoSelecionado.livros) {
          if (l?.isbn) isbnCodes.push(l.isbn);
        }
      } else if (
        emprestimoSelecionado.copyCodes &&
        emprestimoSelecionado.copyCodes.length > 0
      ) {
        for (const cc of emprestimoSelecionado.copyCodes) {
          const parts = cc.split("-");
          if (parts.length >= 1 && parts[0])
            isbnCodes.push(parts[0]);
        }
      }

      if (isbnCodes.length === 0) {
        throw new Error(
          "Nenhum ISBN encontrado para processar a devolução."
        );
      }

      // Determine userId for the return: prefer usuarioId, then usuario.enrollment, then usuario.id
      const userId =
        emprestimoSelecionado.usuarioId ||
        (emprestimoSelecionado.usuario as any)
          ?.enrollment ||
        (emprestimoSelecionado.usuario as any)?.id;

      if (!userId) {
        throw new Error(
          "Nenhum usuário associado ao empréstimo — não é possível registrar a devolução."
        );
      }

      const response = await emprestimosService.devolver({
        isbnCodes,
        userId: Number(userId),
      });
      const successIsbn = response?.successIsbn ?? [];
      const failedIsbn = response?.failedIsbn ?? [];
      const hasSuccess = successIsbn.length > 0;
      const hasFailed = failedIsbn.length > 0;
      const detalhes = [
        hasSuccess
          ? `${successIsbn.length} devolvido(s)`
          : null,
        hasFailed ? `${failedIsbn.length} falha(s)` : null,
      ]
        .filter(Boolean)
        .join(" • ");
      const mensagem = [response?.message, detalhes]
        .filter(Boolean)
        .join(" ");

      if (hasSuccess && hasFailed) {
        toast.info(
          mensagem || "Devolução parcial registrada."
        );
      } else if (hasSuccess) {
        toast.success(
          mensagem || "Devolução registrada com sucesso!"
        );
      } else {
        toast.error(
          mensagem || "Nenhuma devolução foi registrada."
        );
      }

      setEmprestimoSelecionado(null);
      if (hasSuccess) {
        fetchEmprestimos();
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Erro ao registrar devolução";
      toast.error(message);
    }
  };

  const calcularDiasRestantes = (
    dataEmprestimo: string
  ) => {
    const dataEmp = new Date(dataEmprestimo);
    const prazo = new Date(dataEmp);
    prazo.setDate(prazo.getDate() + 14); // 14 dias de prazo
    const hoje = new Date();
    const diff = Math.ceil(
      (prazo.getTime() - hoje.getTime()) /
        (1000 * 3600 * 24)
    );
    return {
      dias: diff,
      prazo: prazo.toLocaleDateString("pt-BR"),
    };
  };

  return (
    <PageLayout perfil="BIBLIOTECARIO">
      <div className="w-full max-w-7xl mx-auto">
        <PageBreadcrumb
          items={[
            {
              label: "Início",
              href: "/bibliotecario/dashboard",
            },
            { label: "Devoluções" },
          ]}
          backTo="/bibliotecario/dashboard"
        />
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Registro de Devoluções
          </h1>
          <p className="text-gray-600 mt-1">
            Registre as devoluções de livros emprestados
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              Carregando empréstimos...
            </p>
          </div>
        ) : emprestimos.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700">
                Nenhum empréstimo ativo
              </p>
              <p className="text-gray-500 mt-1">
                Todos os livros foram devolvidos
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {emprestimos.map((emprestimo) => {
              const { dias, prazo } = calcularDiasRestantes(
                emprestimo.dataEmprestimo
              );
              const atrasado = dias < 0;

              return (
                <Card
                  key={emprestimo.id}
                  className="shadow-lg"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        {emprestimo.livro?.titulo ||
                          emprestimo.livros?.[0]?.titulo ||
                          "Livro não informado"}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={
                          atrasado
                            ? "bg-red-100 text-red-800 border-red-300"
                            : "bg-green-100 text-green-800 border-green-300"
                        }
                      >
                        {atrasado ? "Atrasado" : "Em dia"}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <User className="h-4 w-4" />
                      {emprestimo.usuario?.nome ||
                        "Usuário não informado"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-gray-500">
                          Data Empréstimo
                        </p>
                        <p className="font-medium">
                          {new Date(
                            emprestimo.dataEmprestimo
                          ).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">
                          Prazo Devolução
                        </p>
                        <p className="font-medium flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {prazo}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() =>
                        handleDevolver(emprestimo)
                      }
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Registrar Devolução
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <AlertDialog
          open={!!emprestimoSelecionado}
          onOpenChange={() =>
            setEmprestimoSelecionado(null)
          }
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Confirmar Devolução
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja registrar a devolução
                do livro{" "}
                <span className="font-semibold">
                  {emprestimoSelecionado?.livro?.titulo ||
                    emprestimoSelecionado?.livros?.[0]
                      ?.titulo ||
                    "Livro não informado"}
                </span>
                ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmarDevolucao}
                className="bg-green-600 hover:bg-green-700"
              >
                Confirmar Devolução
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageLayout>
  );
}
