import { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

export function Relatorios() {
  const [carregando, setCarregando] = useState(false);

  const relatoriosDisponiveis = [
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
  ];

  const handleGerarRelatorio = async (
    tipo: string,
    titulo: string
  ) => {
    setCarregando(true);
    try {
      // Simulação de geração de relatório
      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );

      toast.success("Relatório gerado com sucesso!", {
        description: `${titulo} está pronto para download`,
      });

      // TODO: Integrar com backend para gerar relatório real
      console.log(`Gerando relatório: ${tipo}`);
    } catch (error) {
      toast.error("Erro ao gerar relatório");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageBreadcrumb
        items={[
          { label: "Início", href: "/usuario" },
          { label: "Relatórios" },
        ]}
        backTo="/usuario"
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
            <div className="text-2xl font-bold">1,284</div>
            <p className="text-xs text-muted-foreground mt-1">
              +12% do mês anterior
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
            <div className="text-2xl font-bold">8,592</div>
            <p className="text-xs text-muted-foreground mt-1">
              +23 novos esta semana
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
            <div className="text-2xl font-bold">2,456</div>
            <p className="text-xs text-muted-foreground mt-1">
              89% taxa de atividade
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Relatórios Disponíveis */}
      <div>
        <h3 className="text-xl font-semibold mb-4">
          Relatórios Disponíveis
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {relatoriosDisponiveis.map((relatorio) => {
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
                <CardContent>
                  <Button
                    className="w-full gap-2"
                    onClick={() =>
                      handleGerarRelatorio(
                        relatorio.tipo,
                        relatorio.titulo
                      )
                    }
                    disabled={carregando}
                  >
                    <Download className="h-4 w-4" />
                    {carregando
                      ? "Gerando..."
                      : "Gerar Relatório"}
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
            • Os relatórios são gerados em formato PDF
          </p>
          <p className="text-sm text-muted-foreground">
            • Você pode filtrar por período na versão
            completa
          </p>
          <p className="text-sm text-muted-foreground">
            • Relatórios ficam disponíveis para download por
            30 dias
          </p>
          <p className="text-sm text-muted-foreground">
            • Em caso de dúvidas, entre em contato com o
            suporte
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default Relatorios;
