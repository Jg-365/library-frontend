import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "@/services/api";
import { livrosService } from "@/services/livrosService";
import { PageLayout } from "@/components/layouts";
import { PageBreadcrumb } from "@/components/layouts/PageBreadcrumb";
import { SelectUserDialog } from "@/components/main/SelectUserDialog";
import type { Livro, Perfil } from "@/types";
import {
  BookFilters,
  type BookFilterValues,
} from "@/components/main/filter";
import { filterBooks } from "@/components/main/book-filters";
import { BookDetailsDialog } from "@/components/main/book-details-dialog";
import { BookCard } from "@/components/main/book-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/config/constants";
import { emprestimosService } from "@/services/emprestimosService";
import { useAuth } from "@/store/AuthContext";

export function CatalogoLivros() {
  const { user } = useAuth();
  const location = useLocation();
  const [livros, setLivros] = useState<Livro[]>([]);
  const [filteredLivros, setFilteredLivros] = useState<
    Livro[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<BookFilterValues>(
    {}
  );
  const [selectedLivro, setSelectedLivro] =
    useState<Livro | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isSelectUserOpen, setIsSelectUserOpen] =
    useState(false);
  const [
    reservaParaOutroUsuario,
    setReservaParaOutroUsuario,
  ] = useState(false);

  const isAdminOrBibliotecario =
    user?.perfil === "ADMIN" ||
    user?.perfil === "BIBLIOTECARIO";

  const getPerfil = (): Perfil => {
    if (location.pathname.startsWith("/admin")) {
      return "ADMIN";
    }
    if (location.pathname.startsWith("/bibliotecario")) {
      return "BIBLIOTECARIO";
    }
    return "USUARIO";
  };

  const getBasePath = () => {
    if (location.pathname.startsWith("/admin"))
      return "/admin/dashboard";
    if (location.pathname.startsWith("/bibliotecario"))
      return "/bibliotecario/dashboard";
    return "/usuario";
  };

  useEffect(() => {
    const carregarLivros = async () => {
      try {
        setLoading(true);
        const livrosArray =
          await livrosService.listarTodos();
        setLivros(livrosArray);
      } catch (error: any) {
        toast.error("Erro ao carregar livros", {
          description:
            error.message ||
            "Não foi possível carregar o catálogo.",
        });
      } finally {
        setLoading(false);
      }
    };

    carregarLivros();
  }, []);

  useEffect(() => {
    const filtered = filterBooks(livros, filters);
    setFilteredLivros(filtered);
  }, [filters, livros]);

  const handleFilterChange = (
    newFilters: BookFilterValues
  ) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleViewDetails = (livro: Livro) => {
    setSelectedLivro(livro);
    setIsDetailsOpen(true);
  };

  const handleReservar = async (livro: Livro) => {
    // Se for admin/bibliotecário, perguntar se é para si mesmo ou para outro
    if (isAdminOrBibliotecario) {
      setSelectedLivro(livro);
      setReservaParaOutroUsuario(false);
      // Mostrar menu de opções (implementado no BookCard)
      return;
    }

    // Usuário comum faz reserva para si mesmo
    await realizarReserva(livro, user?.enrollment);
  };

  const handleReservarParaMim = async (livro: Livro) => {
    await realizarReserva(livro, user?.enrollment);
  };

  const handleReservarParaOutro = (livro: Livro) => {
    setSelectedLivro(livro);
    setReservaParaOutroUsuario(true);
    setIsSelectUserOpen(true);
  };

  const handleEmprestarParaMim = async (livro: Livro) => {
    await realizarEmprestimo(livro, user?.enrollment);
  };

  const handleEmprestarParaOutro = (livro: Livro) => {
    setSelectedLivro(livro);
    setReservaParaOutroUsuario(true);
    setIsSelectUserOpen(true);
  };

  const handleUserSelected = async (
    userEnrollment: number
  ) => {
    if (selectedLivro) {
      const temCopiasDisponiveis =
        selectedLivro.quantidadeExemplares > 0;
      if (temCopiasDisponiveis) {
        await realizarEmprestimo(
          selectedLivro,
          userEnrollment
        );
      } else {
        await realizarReserva(
          selectedLivro,
          userEnrollment
        );
      }
    }
  };

  const realizarReserva = async (
    livro: Livro,
    enrollment?: number
  ) => {
    try {
      if (!enrollment) {
        toast.error(
          "Erro: matrícula do usuário não encontrada"
        );
        return;
      }

      await api.post(API_ENDPOINTS.RESERVAS.CREATE, {
        userEnrollment: Number(enrollment),
        bookIsbn: livro.isbn,
      });

      toast.success("Livro reservado com sucesso!", {
        description: `${
          reservaParaOutroUsuario
            ? "Reserva criada"
            : "Você tem 4 dias para retirar"
        } "${
          livro?.titulo ??
          (livro as any)?.title ??
          livro?.isbn
        }",`,
      });

      // Recarregar livros para atualizar disponibilidade
      const livrosArray = await livrosService.listarTodos();
      setLivros(livrosArray);
      setReservaParaOutroUsuario(false);
    } catch (error: any) {
      const mensagem =
        error.response?.data?.message ||
        "Erro ao reservar livro";
      toast.error(mensagem);
    }
  };

  const realizarEmprestimo = async (
    livro: Livro,
    enrollment?: number
  ) => {
    try {
      if (!enrollment) {
        toast.error(
          "Erro: matrícula do usuário não encontrada"
        );
        return;
      }

      // Use emprestimosService so the backend receives `isbnCodes` (and userId when admin)
      if (
        isAdminOrBibliotecario &&
        reservaParaOutroUsuario
      ) {
        await emprestimosService.criarParaUsuario(
          Number(enrollment),
          {
            isbnCodes: [livro.isbn],
          }
        );
      } else {
        await emprestimosService.criar({
          isbnCodes: [livro.isbn],
        });
      }

      toast.success("Empréstimo realizado com sucesso!", {
        description: `${
          reservaParaOutroUsuario
            ? "Empréstimo criado"
            : "Prazo de devolução: 14 dias"
        } "${
          livro?.titulo ??
          (livro as any)?.title ??
          livro?.isbn
        }",`,
      });

      // Recarregar livros para atualizar disponibilidade
      const livrosArray = await livrosService.listarTodos();
      setLivros(livrosArray);
      setReservaParaOutroUsuario(false);
    } catch (error: any) {
      const mensagem =
        error.response?.data?.message ||
        "Erro ao realizar empréstimo";
      toast.error(mensagem);
    }
  };

  if (loading) {
    return (
      <PageLayout perfil={getPerfil()}>
        <div className="max-w-7xl mx-auto">
          <Card className="shadow-lg">
            <div className="flex flex-col items-center justify-center py-32">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-xl font-semibold text-gray-600">
                Carregando catálogo...
              </p>
            </div>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout perfil={getPerfil()}>
      <div className="max-w-7xl mx-auto space-y-6">
        <PageBreadcrumb
          items={[
            {
              label: "Início",
              href: getBasePath(),
            },
            { label: "Catálogo de Livros" },
          ]}
          backTo={getBasePath()}
        />
        {/* Título da Página */}
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            Catálogo de Livros
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Explore nosso acervo e reserve os livros que
            deseja
          </p>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Filtrar Livros
            </CardTitle>
            <CardDescription>
              Refine sua busca usando os filtros abaixo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BookFilters
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </CardContent>
        </Card>

        {/* Resultados */}
        <div>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {filteredLivros.length}{" "}
              {filteredLivros.length === 1
                ? "livro encontrado"
                : "livros encontrados"}
            </p>
          </div>

          {filteredLivros.length === 0 ? (
            <Card>
              <CardContent className="py-16">
                <div className="flex flex-col items-center justify-center text-center">
                  <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Nenhum livro encontrado
                  </h3>
                  <p className="text-muted-foreground">
                    Tente ajustar os filtros para encontrar
                    o que procura
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredLivros.map((livro) => {
                const temCopiasDisponiveis =
                  livro.quantidadeExemplares > 0;

                return (
                  <BookCard
                    key={livro.isbn}
                    livro={livro}
                    onDetailsClick={handleViewDetails}
                    onReserveClick={
                      temCopiasDisponiveis
                        ? undefined
                        : handleReservarParaMim
                    }
                    onReserveForOtherClick={
                      temCopiasDisponiveis
                        ? undefined
                        : handleReservarParaOutro
                    }
                    onBorrowClick={
                      temCopiasDisponiveis
                        ? handleEmprestarParaMim
                        : undefined
                    }
                    onBorrowForOtherClick={
                      temCopiasDisponiveis
                        ? handleEmprestarParaOutro
                        : undefined
                    }
                    showReserveButton={
                      !temCopiasDisponiveis
                    }
                    showBorrowButton={temCopiasDisponiveis}
                    isAdminOrBibliotecario={
                      isAdminOrBibliotecario
                    }
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Modal de Seleção de Usuário */}
        <SelectUserDialog
          open={isSelectUserOpen}
          onOpenChange={setIsSelectUserOpen}
          onSelectUser={handleUserSelected}
          title="Reservar para Usuário"
          description="Selecione o usuário para o qual deseja reservar este livro"
        />

        {/* Modal de Detalhes */}
        <BookDetailsDialog
          livro={selectedLivro}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
        />
      </div>
    </PageLayout>
  );
}

export default CatalogoLivros;
