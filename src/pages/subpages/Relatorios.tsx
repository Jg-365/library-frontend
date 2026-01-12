import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { PageLayout } from "@/components/layouts";
import { PageBreadcrumb } from "@/components/layouts/PageBreadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Download,
  FileText,
  TrendingUp,
  Users,
  BookOpen,
  Calendar,
  FileDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  reportsService,
  type ReportFormat,
  type ReportType,
} from "@/services/reportsService";

const RELATORIOS_DISPONIVEIS = [
  {
    id: 1,
    titulo: "Relatório de Empréstimos",
    descricao:
      "Resumo completo de todos os empréstimos do período",
    icon: FileText,
    tipo: "emprestimos",
  },
  {
    id: 2,
    titulo: "Relatório de Usuários",
    descricao:
      "Estatísticas e atividades dos usuários cadastrados",
    icon: Users,
    tipo: "usuarios",
  },
  {
    id: 3,
    titulo: "Relatório de Acervo",
    descricao:
      "Inventário completo de livros e categorias",
    icon: BookOpen,
    tipo: "acervo",
  },
  {
    id: 4,
    titulo: "Relatório de Reservas",
    descricao: "Análise de reservas ativas e concluídas",
    icon: Calendar,
    tipo: "reservas",
  },
  {
    id: 5,
    titulo: "Relatório de Performance",
    descricao: "Métricas e KPIs do sistema de biblioteca",
    icon: TrendingUp,
    tipo: "performance",
  },
] as const;

const RELATORIOS_ENDPOINTS = [
  {
    tipo: "emprestimos",
    endpoint: "GET /loans/users",
  },
  {
    tipo: "usuarios",
    endpoint: "GET /users/all (admin/bibliotecário) | GET /users/me",
  },
  {
    tipo: "acervo",
    endpoint: "GET /books",
  },
  {
    tipo: "reservas",
    endpoint: "GET /reserves/users",
  },
  {
    tipo: "performance",
    endpoint: "Agregado local (loans/users/books/reserves)",
  },
] as const;

export function Relatorios() {
  const [carregando, setCarregando] = useState(false);
  const [resumo, setResumo] = useState({
    totalEmprestimos: 0,
    totalLivros: 0,
    totalUsuarios: 0,
    usuariosAtivos: 0,
  });
  const [erroResumo, setErroResumo] =
    useState<string | null>(null);
  const location = useLocation();

  const getPerfil = () => {
    if (location.pathname.startsWith("/admin"))
      return "ADMIN";
    if (location.pathname.startsWith("/bibliotecario"))
      return "BIBLIOTECARIO";
    return "USUARIO";
  };

  const perfil = getPerfil();

  useEffect(() => {
    let ativo = true;
    const carregarResumo = async () => {
      setErroResumo(null);
      try {
        const dados = await reportsService.getSummary(perfil);
        if (ativo) {
          setResumo(dados);
        }
      } catch (error) {
        if (ativo) {
          setErroResumo(
            "Não foi possível carregar o resumo dos relatórios."
          );
        }
      }
    };

    carregarResumo();
    return () => {
      ativo = false;
    };
  }, [perfil]);

  const handleGerarRelatorio = async (
    tipo: ReportType,
    titulo: string,
    formato: ReportFormat
  ) => {
    setCarregando(true);
    try {
      const dataset = await reportsService.getReportDataset(
        tipo,
        perfil
      );

      reportsService.downloadReport(dataset, formato);

      toast.success("Relatório gerado com sucesso!", {
        description: `${titulo} pronto para download (${formato.toUpperCase()})`,
      });
    } catch (error) {
      toast.error("Erro ao gerar relatório", {
        description:
          "Não foi possível gerar o relatório agora. Tente novamente.",
      });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <PageLayout perfil={perfil}>
      <div className="max-w-7xl mx-auto space-y-6">
        <PageBreadcrumb
          items={[
            {
              label: "Início",
              href:
                perfil === "ADMIN"
                  ? "/admin/dashboard"
                  : perfil === "BIBLIOTECARIO"
                  ? "/bibliotecario/dashboard"
                  : "/usuario",
            },
            { label: "Relatórios" },
          ]}
          backTo={
            perfil === "ADMIN"
              ? "/admin/dashboard"
              : perfil === "BIBLIOTECARIO"
              ? "/bibliotecario/dashboard"
              : "/usuario"
          }
        />
        {/* Título da Página */}
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Relatórios
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Gere relatórios detalhados sobre o sistema de
            biblioteca
          </p>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Empréstimos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {resumo.totalEmprestimos}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Dados consolidados do período atual
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Livros no Acervo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {resumo.totalLivros}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total de registros disponíveis
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Usuários Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {resumo.usuariosAtivos}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {resumo.totalUsuarios > 0
                  ? `${resumo.totalUsuarios} cadastrados no total`
                  : "Sem usuários cadastrados"}
              </p>
            </CardContent>
          </Card>
        </div>

        {erroResumo && (
          <Card>
            <CardContent className="pt-6 text-sm text-destructive">
              {erroResumo}
            </CardContent>
          </Card>
        )}

        {/* Relatórios Disponíveis */}
        <div>
          <h3 className="text-xl font-semibold mb-4">
            Relatórios Disponíveis
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {RELATORIOS_DISPONIVEIS.map((relatorio) => {
              const Icon = relatorio.icon;
              return (
                <Card
                  key={relatorio.id}
                  className="hover:shadow-lg transition-all duration-200"
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <CardTitle className="text-lg">
                        {relatorio.titulo}
                      </CardTitle>
                    </div>
                    <CardDescription>
                      {relatorio.descricao}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      className="w-full gap-2"
                      onClick={() =>
                        handleGerarRelatorio(
                          relatorio.tipo,
                          relatorio.titulo,
                          "pdf"
                        )
                      }
                      disabled={carregando}
                    >
                      <Download className="h-4 w-4" />
                      {carregando
                        ? "Gerando..."
                        : "Gerar PDF"}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() =>
                        handleGerarRelatorio(
                          relatorio.tipo,
                          relatorio.titulo,
                          "csv"
                        )
                      }
                      disabled={carregando}
                    >
                      <FileDown className="h-4 w-4" />
                      {carregando
                        ? "Gerando..."
                        : "Baixar CSV"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Informações Adicionais */}
        <Card>
          <CardHeader>
            <CardTitle>
              Informações sobre Relatórios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              • Os relatórios são gerados diretamente a partir
              dos dados retornados pela API
            </p>
            <p className="text-sm text-muted-foreground">
              • PDF e CSV ficam disponíveis para download
              imediato após a geração
            </p>
            <p className="text-sm text-muted-foreground">
              • Para perfis administrativos, relatórios de
              usuários usam o endpoint completo
            </p>
          </CardContent>
        </Card>

        {/* Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle>
              Endpoints de Relatórios
            </CardTitle>
            <CardDescription>
              Base atual usada para geração dos relatórios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {RELATORIOS_ENDPOINTS.map((item) => (
              <p
                key={item.tipo}
                className="text-sm text-muted-foreground"
              >
                • {item.tipo}: {item.endpoint}
              </p>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

export default Relatorios;
