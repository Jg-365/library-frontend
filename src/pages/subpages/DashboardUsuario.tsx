import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layouts";
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
  BookOpen,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { BookCard } from "@/components/main/book-card";
import { ReservaCard } from "@/components/main/reserva-card";
import { BookDetailsDialog } from "@/components/main/book-details-dialog";
import type { Livro, Reserva } from "@/types";
import { toast } from "sonner";
import { livrosService } from "@/services/livrosService";
import { reservasService } from "@/services/reservasService";
import { emprestimosService } from "@/services/emprestimosService";
import { useAuth as useAuthContext } from "@/store/AuthContext";
import { getErrorMessage } from "@/lib/errorMessage";

const quickActions = [
  {
    title: "Catálogo de Livros",
    description: "Explore nosso acervo e reserve livros",
    icon: BookOpen,
    href: "/usuario/livros",
  },
  {
    title: "Meus Empréstimos",
    description: "Acompanhe seus empréstimos e devoluções",
    icon: BarChart3,
    href: "/usuario/emprestimos",
  },
];

export function DashboardUsuario() {
  const { user } = useAuthContext();
  const [livrosDestaque, setLivrosDestaque] = useState<
    Livro[]
  >([]);
  const [reservasAtivas, setReservasAtivas] = useState<
    Reserva[]
  >([]);
  const [livroSelecionado, setLivroSelecionado] =
    useState<Livro | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setCarregando(true);

      // Buscar livros disponíveis (limitado a 6 para destaque)
      const livrosArray = await livrosService.listarTodos();

      const livrosDisponiveis = livrosArray
        .filter(
          (livro: Livro) => livro.quantidadeExemplares > 0
        )
        .slice(0, 6);
      setLivrosDestaque(livrosDisponiveis);

      // Buscar reservas ativas do usuário
      const reservasArray =
        await reservasService.listarPorUsuario();

      // Filtrar apenas as ativas (se backend não retornar status, todas são consideradas ativas)
      const ativas = reservasArray.filter(
        (r: Reserva) => !r.status || r.status === "ATIVA"
      );
      setReservasAtivas(ativas);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error(
        "Erro ao carregar informações do dashboard"
      );
    } finally {
      setCarregando(false);
    }
  };

  const handleVerDetalhes = (livro: Livro) => {
    setLivroSelecionado(livro);
    setDialogAberto(true);
  };

  const handleReservar = async (livro: Livro) => {
    try {
      // Verificar disponibilidade ANTES de tentar reservar
      if (
        livro.quantidadeExemplares &&
        livro.quantidadeExemplares > 0
      ) {
        toast.error(
          "Este livro está disponível! Use 'Emprestar' ao invés de 'Reservar'"
        );
        return;
      }

      // Obter matrícula do usuário do contexto de autenticação
      console.log("👤 User completo:", user);

      if (!user?.enrollment) {
        toast.error("Usuário não autenticado");
        return;
      }

      // TEMPORÁRIO: Tentar converter enrollment para número se for string numérica
      let userEnrollment: number | string = user.enrollment;

      // Se enrollment for string mas contiver apenas dígitos, converter para número
      if (
        typeof userEnrollment === "string" &&
        /^\d+$/.test(userEnrollment)
      ) {
        userEnrollment = parseInt(userEnrollment, 10);
        console.log(
          "✅ Convertido enrollment para número:",
          userEnrollment
        );
      } else if (typeof userEnrollment === "string") {
        toast.error(
          "Matrícula do usuário inválida. Entre em contato com o administrador."
        );
        console.error(
          "❌ Enrollment não é numérico:",
          userEnrollment
        );
        return;
      }

      const payload = {
        userEnrollment: userEnrollment,
        bookIsbn: livro.isbn,
      };

      console.log("📚 Criando reserva:");
      console.log(
        "  - User enrollment:",
        userEnrollment,
        "Type:",
        typeof userEnrollment
      );
      console.log(
        "  - Book ISBN:",
        livro.isbn,
        "Type:",
        typeof livro.isbn
      );
      console.log(
        "  - Payload:",
        JSON.stringify(payload, null, 2)
      );

      await reservasService.criar(payload);

      toast.success("Livro reservado com sucesso!");
      carregarDados(); // Recarregar dados
    } catch (error: any) {
      console.error("❌ Erro ao reservar:", error);
      console.error("❌ Response:", error.response?.data);
      const mensagem = getErrorMessage(
        error.response?.data?.message ||
          error.response?.data?.error,
        "Erro ao reservar livro"
      );
      toast.error(mensagem);
    }
  };

  const handleEmprestar = async (livro: Livro) => {
    try {
      if (!user?.enrollment) {
        toast.error("Usuário não autenticado");
        return;
      }

      // Payload para criar empréstimo
      const payload = {
        isbnCodes: [livro.isbn],
      };

      console.log("📚 Criando empréstimo:", payload);
      const response = await emprestimosService.criar(
        payload
      );

      console.log(
        "✅ Empréstimo criado com sucesso:",
        response
      );

      toast.success("Livro emprestado com sucesso!");

      // Aguardar um pouco antes de recarregar para garantir que o backend processou
      setTimeout(() => {
        carregarDados();
      }, 500);
    } catch (error: any) {
      console.error("❌ Erro ao emprestar:", error);
      console.error(
        "❌ Response completa:",
        error.response
      );
      const mensagem = getErrorMessage(
        error.response?.data?.message ||
          error.response?.data?.error,
        "Erro ao emprestar livro"
      );
      toast.error(mensagem);
    }
  };

  const handleCancelarReserva = async (
    reserva: Reserva
  ) => {
    try {
      await reservasService.deletar(reserva.id);
      toast.success("Reserva cancelada com sucesso!");
      carregarDados();
    } catch (error: any) {
      const mensagem = getErrorMessage(
        error.response?.data?.message,
        "Erro ao cancelar reserva"
      );
      toast.error(mensagem);
    }
  };

  const handleVerDetalhesReserva = (reserva: Reserva) => {
    if (reserva.livro) {
      handleVerDetalhes(reserva.livro);
    }
  };

  if (carregando) {
    return (
      <PageLayout perfil={"USUARIO"}>
        <div className="max-w-7xl mx-auto">
          <Card className="shadow-lg">
            <div className="flex flex-col items-center justify-center py-32">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-xl font-semibold text-gray-600">
                Carregando dashboard...
              </p>
            </div>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout perfil={"USUARIO"}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Título da Página */}
        <div>
          {/* Boas vindas direta ao usuário */}
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Bem-vindo de volta{" "}
            <span className="font-bold">
              {user?.nome || "Usuário"}
            </span>
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Explore nosso acervo e gerencie suas reservas e
            empréstimos
          </p>
        </div>
        {/* Quick Actions Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Ações Rápidas
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
                >
                  <Link to={action.href}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-600 transition-all duration-200">
                          <Icon className="h-5 w-5 text-blue-600 group-hover:text-white transition-colors duration-200" />
                        </div>
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors duration-200">
                          {action.title}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        {action.description}
                      </CardDescription>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Minhas Reservas Ativas */}
        {reservasAtivas.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-800">
                  Minhas Reservas Ativas
                </h3>
              </div>
              <Link to="/usuario/reservas">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                >
                  Ver todas
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reservasAtivas.slice(0, 3).map((reserva) => (
                <ReservaCard
                  key={reserva.id}
                  reserva={reserva}
                  onVerDetalhes={handleVerDetalhesReserva}
                />
              ))}
            </div>
          </div>
        )}

        {/* Livros Disponíveis para Reserva */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-800">
                Livros Disponíveis
              </h3>
            </div>
            <Link to="/usuario/livros">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
              >
                Ver catálogo completo
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {livrosDestaque.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Nenhum livro disponível no momento
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  Não há livros disponíveis para reserva no
                  momento
                </p>
                <Link to="/usuario/livros">
                  <Button variant="outline">
                    Ir para o catálogo completo
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {livrosDestaque.map((livro) => (
                <BookCard
                  key={livro.isbn}
                  livro={livro}
                  onDetailsClick={handleVerDetalhes}
                  onReserveClick={handleReservar}
                  onBorrowClick={handleEmprestar}
                  showReserveButton={
                    livro.quantidadeExemplares === 0
                  }
                  showBorrowButton={
                    (livro.quantidadeExemplares ?? 0) > 0
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Dialog de Detalhes do Livro */}
        <BookDetailsDialog
          livro={livroSelecionado}
          open={dialogAberto}
          onOpenChange={setDialogAberto}
        />
      </div>
    </PageLayout>
  );
}

export default DashboardUsuario;
