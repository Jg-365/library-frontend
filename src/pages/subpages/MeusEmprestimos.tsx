import { useEffect, useState } from "react";
import { emprestimosService } from "@/services/emprestimosService";
import { PageBreadcrumb } from "@/components/layouts/PageBreadcrumb";
import type { Emprestimo } from "@/types";
import { DataTable } from "@/components/main/data-table";
import { emprestimosColumn } from "@/components/ui/columns/emprestimosColumn";
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
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

export function MeusEmprestimos() {
  const [emprestimos, setEmprestimos] = useState<
    Emprestimo[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarEmprestimos = async () => {
      try {
        setLoading(true);
        // Usa o serviço que mapeia os empréstimos e busca os livros
        const emprestimosArray =
          await emprestimosService.listarPorUsuario();

        console.log(
          "📚 Empréstimos mapeados:",
          emprestimosArray
        );
        setEmprestimos(emprestimosArray);
      } catch (error: any) {
        console.error(
          "❌ Erro ao carregar empréstimos:",
          error
        );
        toast.error("Erro ao carregar empréstimos", {
          description:
            error.message ||
            "Não foi possível carregar seus empréstimos.",
        });
      } finally {
        setLoading(false);
      }
    };

    carregarEmprestimos();
  }, []);

  const estatisticas = {
    total: emprestimos.length,
    ativos: emprestimos.filter((e) => !e.dataDevolucaoReal)
      .length,
    atrasados: emprestimos.filter((e) => {
      if (e.dataDevolucaoReal) return false;
      const hoje = new Date();
      const dataPrevista = new Date(
        e.dataPrevistaDevolucao
      );
      return hoje > dataPrevista;
    }).length,
    concluidos: emprestimos.filter(
      (e) => e.dataDevolucaoReal
    ).length,
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card className="shadow-lg">
          <div className="flex flex-col items-center justify-center py-32">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-xl font-semibold text-gray-600">
              Carregando seus empréstimos...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageBreadcrumb
        items={[
          { label: "Início", href: "/usuario" },
          { label: "Meus Empréstimos" },
        ]}
        backTo="/usuario"
      />
      {/* Título da Página */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-600" />
          Meus Empréstimos
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Acompanhe todos os seus empréstimos e devoluções
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Empréstimos
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estatisticas.total}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Todos os registros
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Empréstimos Ativos
            </CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {estatisticas.ativos}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Em andamento
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Atrasados
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {estatisticas.atrasados}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Necessitam atenção
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Concluídos
            </CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {estatisticas.concluidos}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Devoluções realizadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Empréstimos */}
      <Card className="shadow-xl border-0 backdrop-blur-sm bg-white/80">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Histórico de Empréstimos
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {emprestimos.length}{" "}
                {emprestimos.length === 1
                  ? "empréstimo registrado"
                  : "empréstimos registrados"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {estatisticas.ativos} Ativo
                {estatisticas.ativos !== 1 && "s"}
              </Badge>
              {estatisticas.atrasados > 0 && (
                <Badge
                  variant="destructive"
                  className="text-sm"
                >
                  {estatisticas.atrasados} Atrasado
                  {estatisticas.atrasados !== 1 && "s"}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {emprestimos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-xl font-semibold text-gray-600">
                Nenhum empréstimo encontrado
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Você ainda não possui empréstimos
                registrados.
              </p>
            </div>
          ) : (
            <DataTable
              columns={emprestimosColumn}
              data={emprestimos}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default MeusEmprestimos;
