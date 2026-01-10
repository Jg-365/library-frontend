import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "@/services/api";
import type {
  Categoria,
  Subcategoria,
  Perfil,
} from "@/types";
import { createCategoriaColumn } from "@/components/ui/columns/categoriaColumn";
import { DataTable } from "@/components/main/data-table";
import { CategoriaForm } from "@/components/forms/CategoriaForm";
import { SubcategoriaForm } from "@/components/forms/SubcategoriaForm";
import {
  subcategoriaColumns,
  type SubcategoriaTable,
} from "@/components/main/subcategoriaColumn";
import { API_ENDPOINTS } from "@/config";
import { categoriasService } from "@/services";
import { PageLayout } from "@/components/layouts";
import { PageBreadcrumb } from "@/components/layouts/PageBreadcrumb";
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
import { Input } from "@/components/ui/input";
import { FolderTree, Plus, List } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errorMessage";

export function CadastroCategorias() {
  const location = useLocation();
  const [categorias, setCategorias] = useState<Categoria[]>(
    []
  );
  const [subcategorias, setSubcategorias] = useState<
    Subcategoria[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [
    isSubcategoriaDialogOpen,
    setIsSubcategoriaDialogOpen,
  ] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] =
    useState(false);
  const [selectedCategoria, setSelectedCategoria] =
    useState<Categoria | null>(null);
  const [selectedSubcategoria, setSelectedSubcategoria] =
    useState<SubcategoriaTable | null>(null);
  const [categoriaToDelete, setCategoriaToDelete] =
    useState<Categoria | null>(null);
  const [descricaoBusca, setDescricaoBusca] =
    useState("");

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
    carregarCategorias();
  }, []);

  const carregarCategorias = async (
    description: string = ""
  ) => {
    try {
      setLoading(true);

      // Carregar categorias
      const categoriasRes =
        await categoriasService.listarTodas(description);

      // Mapear campos do backend para o frontend
      const categoriasFormatadas = categoriasRes.map(
        (cat: any) => ({
          categoryCode: cat.categoryCode ?? cat.id,
          description:
            cat.description || cat.descricao || cat.nome,
        })
      );

      console.log(
        "Categorias formatadas (CadastroCategorias):",
        categoriasFormatadas
      );
      setCategorias(categoriasFormatadas);

      // Carregar subcategorias
      try {
        const subcategoriasRes = await api.get(
          API_ENDPOINTS.SUBCATEGORIAS.BASE
        );
        const subcategoriasFormatadas =
          subcategoriasRes.data?.map((sub: any) => ({
            id: sub.id,
            description:
              sub.description || sub.nome || sub.descricao,
            categoryCode:
              sub.category?.categoryCode ||
              sub.categoryCode ||
              sub.categoriaId,
            category: sub.category,
          })) || [];

        setSubcategorias(subcategoriasFormatadas);
      } catch (subError: any) {
        console.warn(
          "Erro ao carregar subcategorias:",
          subError.message
        );
        setSubcategorias([]);
      }
    } catch (error: any) {
      toast.error("Erro ao carregar categorias", {
        description:
          error.message ||
          "Não foi possível carregar as categorias.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (categoria: Categoria) => {
    setSelectedCategoria(categoria);
    setIsDialogOpen(true);
  };

  const handleDelete = (categoria: Categoria) => {
    setCategoriaToDelete(categoria);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoriaToDelete) return;

    try {
      await api.delete(
        API_ENDPOINTS.CATEGORIAS.BY_ID(
          categoriaToDelete.categoryCode
        )
      );
      toast.success("Categoria excluída com sucesso!");
      carregarCategorias();
    } catch (error: any) {
      toast.error("Erro ao excluir categoria", {
        description:
          getErrorMessage(
            error.response?.data?.message,
            "Tente novamente"
          ),
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setCategoriaToDelete(null);
    }
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedCategoria(null);
    carregarCategorias();
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setSelectedCategoria(null);
  };

  const handleNovaCategoria = () => {
    setSelectedCategoria(null);
    setIsDialogOpen(true);
  };

  const handleBuscarCategorias = async () => {
    await carregarCategorias(descricaoBusca);
  };

  const handleLimparBusca = async () => {
    setDescricaoBusca("");
    await carregarCategorias("");
  };

  // Handlers de Subcategoria
  const handleNovaSubcategoria = () => {
    setSelectedSubcategoria(null);
    setIsSubcategoriaDialogOpen(true);
  };

  const handleEditarSubcategoria = (
    subcategoria: SubcategoriaTable
  ) => {
    setSelectedSubcategoria(subcategoria);
    setIsSubcategoriaDialogOpen(true);
  };

  const handleDeletarSubcategoria = async (
    subcategoria: SubcategoriaTable
  ) => {
    if (
      !confirm(
        `Tem certeza que deseja deletar a subcategoria "${subcategoria.descricao}"?`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("auth-token");
      const userData = localStorage.getItem("user-data");
      const user = userData ? JSON.parse(userData) : null;

      console.log(
        "Deletando subcategoria ID:",
        subcategoria.id
      );
      console.log("Usuário logado:", user);
      console.log("Perfil do usuário:", user?.perfil);
      console.log("Subcategoria completa:", subcategoria);
      console.log(
        "URL DELETE:",
        API_ENDPOINTS.SUBCATEGORIAS.BY_ID(subcategoria.id)
      );
      console.log("Token presente:", !!token);
      console.log(
        "Token (primeiros 50 chars):",
        token?.substring(0, 50)
      );

      await api.delete(
        API_ENDPOINTS.SUBCATEGORIAS.BY_ID(subcategoria.id)
      );
      toast.success("Subcategoria deletada com sucesso!");
      carregarCategorias();
    } catch (error: any) {
      console.error("Erro ao deletar subcategoria:", error);
      console.error("Status:", error.response?.status);
      console.error("Dados do erro:", error.response?.data);

      const errorMessage = getErrorMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message,
        "Erro desconhecido"
      );

      // Evita mostrar toast duplicado se o interceptor já mostrou
      if (
        error.response?.status !== 401 &&
        error.response?.status !== 403
      ) {
        toast.error("Erro ao deletar subcategoria", {
          description: errorMessage,
        });
      } else if (error.response?.status === 403) {
        toast.error("Sem permissão", {
          description:
            "Você não tem permissão para deletar subcategorias. Apenas ADMIN e BIBLIOTECÁRIO podem fazer isso.",
        });
      } else if (error.response?.status === 401) {
        toast.error("Token inválido", {
          description:
            "Seu token de autenticação é inválido. Por favor, faça logout e login novamente.",
        });
      }
    }
  };

  const subcategoriasTableData: SubcategoriaTable[] =
    subcategorias.map((sub: any) => {
      // Backend retorna category como objeto completo: { categoryCode, description }
      const categoriaId =
        sub.category?.categoryCode ||
        sub.categoryCode ||
        sub.cod_categoria_principal;
      const categoriaNome =
        sub.category?.description || "N/A";

      return {
        id: sub.id,
        cod_subcategoria:
          sub.subCategoryCode ||
          sub.codigo ||
          String(sub.id),
        descricao:
          sub.description,
        cod_categoria_principal: categoriaId,
        categoria_nome: categoriaNome,
      };
    });

  const categoriaColumns = createCategoriaColumn({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  if (loading) {
    return (
      <PageLayout perfil={getPerfil()}>
        <div className="max-w-7xl mx-auto">
          <Card className="shadow-lg">
            <div className="flex flex-col items-center justify-center py-32">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-xl font-semibold text-gray-600">
                Carregando categorias...
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
            { label: "Início", href: getBasePath() },
            { label: "Categorias" },
          ]}
          backTo={getBasePath()}
        />
        {/* Título e Botão de Adicionar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <FolderTree className="text-blue-600" />
              Gerenciamento de Categorias
            </h1>
            <p className="text-gray-600">
              Cadastre e gerencie as categorias de livros do
              sistema
            </p>
          </div>
          <Button onClick={handleNovaCategoria} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Nova Categoria
          </Button>
        </div>

        {/* Tabela de Categorias */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              Categorias Cadastradas
            </CardTitle>
            <CardDescription>
              {categorias.length}{" "}
              {categorias.length === 1
                ? "categoria encontrada"
                : "categorias encontradas"}
            </CardDescription>
            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center">
              <Input
                placeholder="Buscar por descrição"
                value={descricaoBusca}
                onChange={(event) =>
                  setDescricaoBusca(event.target.value)
                }
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBuscarCategorias}
                >
                  Buscar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleLimparBusca}
                >
                  Limpar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={categoriaColumns}
              data={categorias}
            />
          </CardContent>
        </Card>

        {/* Tabela de Subcategorias */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <List className="h-5 w-5" />
                  Cadastro de Subcategorias
                </CardTitle>
                <CardDescription>
                  {subcategorias.length}{" "}
                  {subcategorias.length === 1
                    ? "subcategoria encontrada"
                    : "subcategorias encontradas"}
                </CardDescription>
              </div>
              <Button onClick={handleNovaSubcategoria}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Subcategoria
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={subcategoriaColumns(
                handleEditarSubcategoria,
                handleDeletarSubcategoria
              )}
              data={subcategoriasTableData}
            />
          </CardContent>
        </Card>

        {/* Dialog de Criar/Editar Categoria */}
        <CustomModal
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        >
          <CustomModalContent
            className="sm:max-w-[600px]"
            showCloseButton
            onClose={() => setIsDialogOpen(false)}
          >
            <CustomModalHeader>
              <CustomModalTitle className="flex items-center gap-2">
                <FolderTree className="h-5 w-5 text-blue-600" />
                {selectedCategoria
                  ? "Editar Categoria"
                  : "Nova Categoria"}
              </CustomModalTitle>
              <CustomModalDescription>
                {selectedCategoria
                  ? "Atualize as informações da categoria"
                  : "Preencha os dados para cadastrar uma nova categoria"}
              </CustomModalDescription>
            </CustomModalHeader>
            <CategoriaForm
              categoria={selectedCategoria || undefined}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </CustomModalContent>
        </CustomModal>

        {/* Dialog de Criar/Editar Subcategoria */}
        <CustomModal
          open={isSubcategoriaDialogOpen}
          onOpenChange={setIsSubcategoriaDialogOpen}
        >
          <CustomModalContent
            className="sm:max-w-[600px]"
            showCloseButton
            onClose={() =>
              setIsSubcategoriaDialogOpen(false)
            }
          >
            <CustomModalHeader>
              <CustomModalTitle className="flex items-center gap-2">
                <List className="h-5 w-5 text-blue-600" />
                {selectedSubcategoria
                  ? "Editar Subcategoria"
                  : "Nova Subcategoria"}
              </CustomModalTitle>
              <CustomModalDescription>
                {selectedSubcategoria
                  ? "Atualize as informações da subcategoria"
                  : "Preencha os dados para cadastrar uma nova subcategoria"}
              </CustomModalDescription>
            </CustomModalHeader>
            <SubcategoriaForm
              subcategoria={
                selectedSubcategoria
                  ? {
                      id: selectedSubcategoria.id,
                      description:
                        selectedSubcategoria.descricao,
                      categoryCode:
                        selectedSubcategoria.cod_categoria_principal,
                    }
                  : undefined
              }
              onSuccess={() => {
                setIsSubcategoriaDialogOpen(false);
                carregarCategorias();
              }}
              onCancel={() =>
                setIsSubcategoriaDialogOpen(false)
              }
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
                Tem certeza que deseja excluir a categoria{" "}
                <span className="font-semibold text-gray-900">
                  {categoriaToDelete?.description}
                </span>
                ? Esta ação não pode ser desfeita.
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

export default CadastroCategorias;
