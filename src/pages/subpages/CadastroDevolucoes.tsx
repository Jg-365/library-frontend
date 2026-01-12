import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
import { getErrorMessage } from "@/lib/errorMessage";
import type { Emprestimo } from "@/types";

export function CadastroDevolucoes() {
  const location = useLocation();
  const perfil = location.pathname.startsWith("/admin")
    ? "ADMIN"
    : "BIBLIOTECARIO";
  const basePath = location.pathname.startsWith("/admin")
    ? "/admin/dashboard"
    : "/bibliotecario/dashboard";
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
        await emprestimosService.listarPorUsuario();
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
        const nowIso = new Date().toISOString();
        setEmprestimos((prev) =>
          prev.map((emprestimo) =>
            emprestimo.id === emprestimoSelecionado.id
              ? {
                  ...emprestimo,
                  returnDate: nowIso,
                  dataDevolucaoReal:
                    emprestimo.dataDevolucaoReal ??
                    nowIso,
                  status: "DEVOLVIDO",
                }
              : emprestimo
          )
        );
      }
    } catch (error: any) {
      const message = getErrorMessage(
        error.response?.data?.message,
        "Erro ao registrar devolução"
      );
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

  const emprestimosPendentes = emprestimos.filter(
    (emprestimo) =>
      emprestimo.returnDate == null &&
      (emprestimo.status === "ATIVO" ||
        emprestimo.status === "ATRASADO")
  );
  const emprestimosDevolvidos = emprestimos.filter(
    (emprestimo) =>
      emprestimo.returnDate != null ||
      emprestimo.status === "DEVOLVIDO"
  );

  return (
    <PageLayout perfil={perfil}>
      <div className="w-full max-w-7xl mx-auto">
        <PageBreadcrumb
          items={[
            {
              label: "Início",
              href: basePath,
            },
            { label: "Devoluções" },
          ]}
          backTo={basePath}
        />
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
            Registro de Devoluções
          </h1>
          <p className="text-gray-600 mt-1 dark:text-slate-300">
            Registre as devoluções de livros emprestados
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-slate-300">
              Carregando empréstimos...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {emprestimosPendentes.length === 0 ? (
              <Card className="shadow-lg dark:bg-slate-900 dark:text-slate-100">
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 dark:text-slate-200">
                    Nenhuma devolução pendente
                  </p>
                  <p className="text-gray-500 mt-1 dark:text-slate-400">
                    Todos os empréstimos ativos já foram devolvidos
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {emprestimosPendentes.map((emprestimo) => {
                  const { dias, prazo } = calcularDiasRestantes(
                    emprestimo.dataEmprestimo
                  );
                  const atrasado = dias < 0;

                  return (
                    <Card
                      key={emprestimo.id}
                      className="shadow-lg dark:bg-slate-900 dark:text-slate-100"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-sky-600 dark:text-cyan-300" />
                            {emprestimo.livro?.titulo ||
                              emprestimo.livros?.[0]?.titulo ||
                              "Livro não informado"}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className={
                              atrasado
                                ? "bg-red-100 text-red-800 border-red-300 dark:bg-red-500/20 dark:text-red-200 dark:border-red-500/40"
                                : "bg-green-100 text-green-800 border-green-300 dark:bg-green-500/20 dark:text-green-200 dark:border-green-500/40"
                            }
                          >
                            {atrasado ? "Atrasado" : "Em dia"}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-2 mt-2 text-gray-600 dark:text-slate-300">
                          <User className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                          {emprestimo.usuario?.nome ||
                            "Usuário não informado"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-gray-500 dark:text-slate-400">
                              Data Empréstimo
                            </p>
                            <p className="font-medium text-gray-900 dark:text-slate-100">
                              {new Date(
                                emprestimo.dataEmprestimo
                              ).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-slate-400">
                              Prazo Devolução
                            </p>
                            <p className="font-medium flex items-center gap-1 text-gray-900 dark:text-slate-100">
                              <Calendar className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                              {prazo}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() =>
                            handleDevolver(emprestimo)
                          }
                          className="w-full bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 hover:from-sky-600 hover:via-cyan-600 hover:to-emerald-600"
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

            {emprestimosDevolvidos.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    Devolvidos
                  </Badge>
                  <span className="text-sm text-gray-500 dark:text-slate-400">
                    {emprestimosDevolvidos.length} concluído(s)
                  </span>
                </div>
                <div className="grid gap-4">
                  {emprestimosDevolvidos.map((emprestimo) => (
                    <Card
                      key={emprestimo.id}
                      className="shadow-lg dark:bg-slate-900 dark:text-slate-100"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-sky-600 dark:text-cyan-300" />
                            {emprestimo.livro?.titulo ||
                              emprestimo.livros?.[0]?.titulo ||
                              "Livro não informado"}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className="bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                          >
                            Devolvido
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-2 mt-2 text-gray-600 dark:text-slate-300">
                          <User className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                          {emprestimo.usuario?.nome ||
                            "Usuário não informado"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-slate-400">
                              Data Empréstimo
                            </p>
                            <p className="font-medium text-gray-900 dark:text-slate-100">
                              {new Date(
                                emprestimo.dataEmprestimo
                              ).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-slate-400">
                              Data Devolução
                            </p>
                            <p className="font-medium text-gray-900 dark:text-slate-100">
                              {emprestimo.returnDate
                                ? new Date(
                                    emprestimo.returnDate
                                  ).toLocaleDateString("pt-BR")
                                : "Informação indisponível"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
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



