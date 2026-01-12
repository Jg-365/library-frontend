import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  BarChart3,
  Settings,
  FileText,
  Calendar,
  Pencil,
  Shield,
  FolderTree,
  GraduationCap,
  BookCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageLayout } from "@/components/layouts";
import { useAuth as useAuthContext } from "@/store/AuthContext";
import { getJwtSubject } from "@/lib/jwt";
import {
  dashboardService,
  type DashboardStats,
  type AtividadeRecente,
} from "@/services/dashboardService";
import { toast } from "sonner";
function AdminDashboard() {
  const { user, token } = useAuthContext();
  const decodedSubject = getJwtSubject(token);
  const displayName =
    user?.name ??
    user?.username ??
    decodedSubject ??
    user?.role ??
    "Administrador";
  const [stats, setStats] = useState<DashboardStats | null>(
    null
  );
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
      setStats(null);
      setAtividades([]);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Total de Usuários",
      value: loading
        ? "..."
        : stats
        ? stats.totalUsuarios.toLocaleString("pt-BR")
        : "—",
      description: "Cadastrados no sistema",
      icon: Users,
    },
    {
      title: "Livros Cadastrados",
      value: loading
        ? "..."
        : stats
        ? stats.totalLivros.toLocaleString("pt-BR")
        : "—",
      description: "Títulos no acervo",
      icon: BookOpen,
    },
    {
      title: "Empréstimos Ativos",
      value: loading
        ? "..."
        : stats
        ? stats.emprestimosAtivos.toLocaleString("pt-BR")
        : "—",
      description: "Em andamento",
      icon: FileText,
    },
    {
      title: "Reservas Pendentes",
      value: loading
        ? "..."
        : stats
        ? stats.reservasPendentes.toLocaleString("pt-BR")
        : "—",
      description: "Aguardando processamento",
      icon: Calendar,
    },
  ];

  const quickActions = [
    {
      title: "Gerenciar Usuários",
      description:
        "Adicionar, editar ou remover usuários do sistema",
      icon: Users,
      href: "/admin/usuarios",
    },
    {
      title: "Gerenciar Livros",
      description:
        "Cadastrar novos livros e atualizar acervo",
      icon: BookOpen,
      href: "/admin/livros",
    },
    {
      title: "Cat\u00e1logo de Livros",
      description:
        "Consultar e reservar livros dispon\u00edveis",
      icon: BookOpen,
      href: "/admin/catalogo",
    },
    {
      title: "Autores",
      description: "Cadastrar e gerenciar autores",
      icon: Pencil,
      href: "/admin/autores",
    },
    {
      title: "Categorias",
      description: "Gerenciar categorias de livros",
      icon: FolderTree,
      href: "/admin/categorias",
    },
    {
      title: "Cursos",
      description: "Gerenciar cursos da instituição",
      icon: GraduationCap,
      href: "/admin/cursos",
    },
    {
      title: "Professores por Curso",
      description: "Buscar docentes por curso cadastrado",
      icon: Users,
      href: "/admin/professores-por-curso",
    },
    {
      title: "Minhas Reservas",
      description:
        "Ver e gerenciar suas reservas de livros",
      icon: Calendar,
      href: "/admin/reservas",
    },
    {
      title: "Devoluções",
      description: "Registrar devoluções e aplicar multas",
      icon: BookCheck,
      href: "/admin/devolucoes",
    },
    {
      title: "Relatórios",
      description:
        "Visualizar estatísticas e gerar relatórios",
      icon: BarChart3,
      href: "/admin/relatorios",
    },
    {
      title: "Configurações",
      description: "Configurar parâmetros do sistema",
      icon: Settings,
      href: "/admin/configuracoes",
    },
    {
      title: "Segurança",
      description:
        "Configurações de segurança e permissões",
      icon: Shield,
      href: "/admin/seguranca",
    },
  ];

  return (
    <PageLayout perfil="ADMIN">
      <div className="px-4 md:px-6 lg:px-8">
        {/* Saudação ao administrador */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
            Olá, {displayName}!
          </h2>
          <p className="text-muted-foreground mt-1">
            Bem-vindo ao painel administrativo
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
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
                  <div className="p-2 bg-gradient-to-br from-sky-100 via-cyan-100 to-emerald-100 rounded-lg">
                    <Icon className="h-4 w-4 text-sky-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
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
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
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
                        <div className="p-3 bg-gradient-to-br from-sky-100 via-cyan-100 to-emerald-100 rounded-lg group-hover:from-sky-600 group-hover:via-cyan-600 group-hover:to-emerald-600 transition-all duration-200">
                          <Icon className="h-6 w-6 text-sky-600 group-hover:text-white transition-colors duration-200" />
                        </div>
                        <div>
                          <CardTitle className="text-lg group-hover:text-sky-600 transition-colors duration-200">
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
            <CardTitle className="text-xl bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
              Atividades Recentes
            </CardTitle>
            <CardDescription>
              Últimas ações realizadas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando atividades...
                </div>
              ) : atividades.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma atividade recente
                </div>
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

export default AdminDashboard;
