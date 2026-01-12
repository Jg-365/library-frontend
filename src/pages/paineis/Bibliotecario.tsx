import { PageLayout } from "@/components/layouts";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  BookOpen,
  BarChart3,
  FileText,
  Calendar,
  BookPlus,
  Tags,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth as useAuthContext } from "@/store/AuthContext";
import { getJwtSubject } from "@/lib/jwt";
import {
  dashboardService,
  type DashboardStats,
  type AtividadeRecente,
} from "@/services/dashboardService";
import { toast } from "sonner";

function BibliotecarioDashboard() {
  const { user, token } = useAuthContext();
  const decodedSubject = getJwtSubject(token);
  const displayName =
    user?.name ??
    user?.username ??
    decodedSubject ??
    user?.role ??
    "Bibliotecário";
  const [stats, setStats] = useState<DashboardStats>({
    totalUsuarios: 0,
    totalLivros: 0,
    emprestimosAtivos: 0,
    reservasPendentes: 0,
  });
  const [atividades, setAtividades] = useState<
    AtividadeRecente[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [statsData, atividadesData] = await Promise.all(
        [
          dashboardService.getStats(user?.perfil),
          dashboardService.getAtividadesRecentes(
            user?.perfil
          ),
        ]
      );
      setStats(statsData);
      setAtividades(atividadesData);
    } catch (error) {
      console.error(
        "Erro ao carregar dados do dashboard:",
        error
      );
      toast.error(
        "Erro ao carregar informações do dashboard"
      );
      setStats({
        totalUsuarios: 0,
        totalLivros: 0,
        emprestimosAtivos: 0,
        reservasPendentes: 0,
      });
      setAtividades([]);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Livros Cadastrados",
      value: loading
        ? "..."
        : stats.totalLivros.toLocaleString("pt-BR"),
      description: "Títulos no acervo",
      icon: BookOpen,
    },
    {
      title: "Empréstimos Ativos",
      value: loading
        ? "..."
        : stats.emprestimosAtivos.toLocaleString("pt-BR"),
      description: "Em andamento",
      icon: FileText,
    },
    {
      title: "Reservas Pendentes",
      value: loading
        ? "..."
        : stats.reservasPendentes.toLocaleString("pt-BR"),
      description: "Aguardando processamento",
      icon: Calendar,
    },
  ];

  const quickActions = [
    {
      title: "Cadastrar Livro",
      description: "Adicionar novo livro ao acervo",
      icon: BookPlus,
      href: "/bibliotecario/livros",
    },
    {
      title: "Cat\u00e1logo de Livros",
      description:
        "Consultar e reservar livros dispon\u00edveis",
      icon: BookOpen,
      href: "/bibliotecario/catalogo",
    },
    {
      title: "Gerenciar Categorias",
      description: "Organizar categorias e subcategorias",
      icon: Tags,
      href: "/bibliotecario/categorias",
    },
    {
      title: "Ver Empréstimos",
      description: "Gerenciar empréstimos ativos",
      icon: FileText,
      href: "/bibliotecario/emprestimos",
    },
    {
      title: "Minhas Reservas",
      description:
        "Ver e gerenciar suas reservas de livros",
      icon: Calendar,
      href: "/bibliotecario/reservas",
    },
    {
      title: "Ver Reservas",
      description: "Processar reservas pendentes",
      icon: Calendar,
      href: "/bibliotecario/reservas",
    },
    {
      title: "Relatórios",
      description: "Visualizar estatísticas e relatórios",
      icon: BarChart3,
      href: "/bibliotecario/relatorios",
    },
  ];

  return (
    <PageLayout perfil="BIBLIOTECARIO">
      <div className="px-4 md:px-6 lg:px-8">
        {/* Saudação ao bibliotecário */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Olá, {displayName}!
          </h2>
          <p className="text-muted-foreground mt-1">
            Bem-vindo ao painel de gerenciamento da
            biblioteca
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow duration-200"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                    <Icon className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Ações Rápidas
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card
                  key={index}
                  className="hover:shadow-xl transition-all duration-200 hover:-translate-y-1 cursor-pointer group"
                >
                  <Link to={action.href}>
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-200">
                          <Icon className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors duration-200" />
                        </div>
                        <div>
                          <CardTitle className="text-lg group-hover:text-blue-600 transition-colors duration-200">
                            {action.title}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        {action.description}
                      </CardDescription>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Atividades Recentes
            </CardTitle>
            <CardDescription>
              Últimas ações realizadas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p className="text-sm text-muted-foreground">
                  Carregando atividades...
                </p>
              ) : atividades.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma atividade recente
                </p>
              ) : (
                atividades.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between py-3 border-b last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {activity.acao}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        por {activity.usuario}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {dashboardService.formatarTempo(
                        activity.timestamp
                      )}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

export default BibliotecarioDashboard;
