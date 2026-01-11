import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { livrosService } from "@/services";
import { PageBreadcrumb } from "@/components/layouts/PageBreadcrumb";
import type { Livro, Perfil } from "@/types";
import { createBooksColumn } from "@/components/ui/columns/booksColumn";
import { DataTable } from "@/components/main/data-table";
import {
  BookFilters,
  type BookFilterValues,
} from "@/components/main/filter";
import { filterBooks } from "@/components/main/book-filters";
import { BookDetailsDialog } from "@/components/main/book-details-dialog";
import { BookForm } from "@/components/forms/BookForm.tsx";
import { PageLayout } from "@/components/layouts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CustomModal,
  CustomModalContent,
  CustomModalDescription,
  CustomModalHeader,
  CustomModalTitle,
} from "@/components/ui/custom-modal";
import { getErrorMessage } from "@/lib/errorMessage";
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
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";
import { toast } from "sonner";

export function CadastroEdicao() {
  const location = useLocation();
  const [livros, setLivros] = useState<Livro[]>([]);
  const [filteredLivros, setFilteredLivros] = useState<
    Livro[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<BookFilterValues>(
    {}
  );

  // Detecta o perfil pela rota
  const getPerfil = (): Perfil => {
    if (location.pathname.startsWith("/admin")) {
      return "ADMIN";
    }
    if (location.pathname.startsWith("/bibliotecario")) {
      return "BIBLIOTECARIO";
    }
    return "USUARIO";
  };

  const perfil = getPerfil();

  // Modal de detalhes
  const [selectedLivro, setSelectedLivro] =
    useState<Livro | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Modal de cadastro/edição
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLivro, setEditingLivro] = useState<
    Livro | undefined
  >();

  // Modal de confirmação de exclusão
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] =
    useState(false);
  const [livroToDelete, setLivroToDelete] =
    useState<Livro | null>(null);

  useEffect(() => {
    carregarLivros();
  }, []);

  useEffect(() => {
    if (Array.isArray(livros)) {
      const filtered = filterBooks(livros, filters);
      setFilteredLivros(filtered);
    }
  }, [filters, livros]);

  const carregarLivros = async () => {
    try {
      setLoading(true);
      const livrosMapeados =
        await livrosService.listarTodos();
      setLivros(livrosMapeados);
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

  const handleNew = () => {
    setEditingLivro(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (livro: Livro) => {
    setEditingLivro(livro);
    setIsFormOpen(true);
  };

  const handleDelete = (livro: Livro) => {
    setLivroToDelete(livro);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!livroToDelete) return;

    try {
      await livrosService.deletar(livroToDelete.isbn);
      toast.success("Livro excluído com sucesso!");
      carregarLivros();
    } catch (error: any) {
      toast.error("Erro ao excluir livro", {
        description:
          getErrorMessage(
            error.response?.data?.message,
            "Tente novamente"
          ),
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setLivroToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingLivro(undefined);
    carregarLivros();
  };

  const booksColumn = createBooksColumn({
    onViewDetails: handleViewDetails,
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  if (loading) {
    return (
      <PageLayout perfil={perfil}>
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

  // Corrige rota de início para admin
  const getBasePath = () => {
    if (perfil === "ADMIN") return "/admin/dashboard";
    if (perfil === "BIBLIOTECARIO")
      return "/bibliotecario/dashboard";
    return "/usuario";
  };

  return (
    <PageLayout perfil={perfil}>
      <div className="max-w-7xl mx-auto">
        <PageBreadcrumb
          items={[
            {
              label: "Início",
              href: getBasePath(),
            },
            { label: "Livros" },
          ]}
          backTo={getBasePath()}
        />
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Gerenciamento de Livros
                </CardTitle>
                <CardDescription>
                  {filteredLivros.length}{" "}
                  {filteredLivros.length === 1
                    ? "livro encontrado"
                    : "livros encontrados"}
                </CardDescription>
              </div>
              <Button
                onClick={handleNew}
                className="w-full gap-2 sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                Novo Livro
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <BookFilters
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />

            <DataTable
              columns={booksColumn}
              data={filteredLivros}
            />
          </CardContent>
        </Card>

        {/* Modal de Detalhes */}
        <BookDetailsDialog
          livro={selectedLivro}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
        />

        {/* Modal de Cadastro/Edição */}
        <CustomModal
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
        >
          <CustomModalContent
            className="max-w-3xl max-h-[90vh] overflow-y-auto"
            showCloseButton
            onClose={() => setIsFormOpen(false)}
          >
            <CustomModalHeader>
              <CustomModalTitle>
                {editingLivro
                  ? "Editar Livro"
                  : "Cadastrar Novo Livro"}
              </CustomModalTitle>
              <CustomModalDescription>
                {editingLivro
                  ? "Atualize as informações do livro"
                  : "Preencha os dados do novo livro"}
              </CustomModalDescription>
            </CustomModalHeader>
            <BookForm
              livro={editingLivro}
              onSuccess={handleFormSuccess}
              onCancel={() => setIsFormOpen(false)}
            />
          </CustomModalContent>
        </CustomModal>

        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Confirmar Exclusão
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o livro{" "}
                {livroToDelete?.titulo}? Esta ação não pode
                ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageLayout>
  );
}

export default CadastroEdicao;
