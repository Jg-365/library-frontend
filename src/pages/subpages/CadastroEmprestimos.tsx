import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layouts";
import { PageBreadcrumb } from "@/components/layouts/PageBreadcrumb";
// import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Calendar,
  User,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { emprestimosService } from "@/services/emprestimosService";
import type { Emprestimo } from "@/types";

export function CadastroEmprestimos() {
  const [emprestimos, setEmprestimos] = useState<
    Emprestimo[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEmprestimos = async () => {
    try {
      setIsLoading(true);
      // Bibliotecário deve ver TODOS os empréstimos
      const data = await emprestimosService.listarTodos();
      setEmprestimos(data);
    } catch (error: any) {
      toast.error("Erro ao carregar empréstimos");
      console.error("Erro ao buscar empréstimos:", error);
      setEmprestimos([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmprestimos();
  }, []);

  const calcularDiasRestantes = (
    dataEmprestimo?: string
  ) => {
    const dataEmp = new Date(dataEmprestimo ?? Date.now());
    if (isNaN(dataEmp.getTime())) {
      return { dias: 0, prazo: "-" };
    }
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
            { label: "Empréstimos" },
          ]}
          backTo="/bibliotecario/dashboard"
        />
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Gerenciamento de Empréstimos
          </h1>
          <p className="text-gray-600 mt-1">
            Visualize e gerencie todos os empréstimos ativos
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              Carregando empréstimos...
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {emprestimos.map((emprestimo) => {
              const dataReferencia =
                emprestimo.dataEmprestimo ??
                emprestimo.dataInicio;
              const { dias, prazo } =
                calcularDiasRestantes(dataReferencia);
              const atrasado = dias < 0;
              const proximoVencimento =
                dias >= 0 && dias <= 3;

              return (
                <Card
                  key={emprestimo.id}
                  className="shadow-lg"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        {emprestimo.livros &&
                        emprestimo.livros.length > 0
                          ? (emprestimo.livros as any[])
                              .map(
                                (l) =>
                                  l?.titulo ??
                                  (l as any)?.title ??
                                  ""
                              )
                              .filter(Boolean)
                              .join(", ")
                          : "Livros do empréstimo"}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={
                          atrasado
                            ? "bg-red-100 text-red-800 border-red-300"
                            : proximoVencimento
                            ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                            : "bg-green-100 text-green-800 border-green-300"
                        }
                      >
                        {atrasado
                          ? `Atrasado ${Math.abs(
                              dias
                            )} dias`
                          : proximoVencimento
                          ? `Vence em ${dias} dias`
                          : "Em dia"}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <User className="h-4 w-4" />
                      {emprestimo.usuario?.nome ||
                        "Usuário não informado"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">
                          Data Empréstimo
                        </p>
                        <p className="font-medium">
                          {new Date(
                            dataReferencia
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
                    {atrasado && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800">
                          Este empréstimo está atrasado.
                          Entre em contato com o usuário.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
