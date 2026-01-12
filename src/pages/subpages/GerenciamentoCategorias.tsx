import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "@/services/api";
import type {
  Categoria,
  Subcategoria,
  Perfil,
} from "@/types";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  List,
} from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { SubcategoriaForm } from "@/components/forms/SubcategoriaForm";
import {
  subcategoriaColumns,
  type SubcategoriaTable,
} from "@/components/main/subcategoriaColumn";

export function GerenciamentoCategorias() {
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
  const [
    isSubcategoriaTableDialogOpen,
    setIsSubcategoriaTableDialogOpen,
  ] = useState(false);
  const [dialogMode, setDialogMode] = useState<
    "criar" | "editar"
  >("criar");
  const [selectedCategoria, setSelectedCategoria] =
    useState<Categoria | null>(null);
  const [selectedSubcategoria, setSelectedSubcategoria] =
    useState<Subcategoria | null>(null);
  const [
    selectedSubcategoriaTable,
    setSelectedSubcategoriaTable,
  ] = useState<SubcategoriaTable | null>(null);
  const [expandedCategorias, setExpandedCategorias] =
    useState<Set<number>>(new Set());
  const [descricaoBusca, setDescricaoBusca] =
    useState("");

  // Form states
  const [descricaoCategoria, setDescricaoCategoria] =
    useState("");
  const [descricaoSubcategoria, setDescricaoSubcategoria] =
    useState("");
  const [
    categoriaIdSubcategoria,
    setCategoriaIdSubcategoria,
  ] = useState<number | null>(null);

  const getPerfil = (): Perfil => {
    if (location.pathname.startsWith("/admin/dashboard"))
      return "ADMINISTRADOR";
    if (
      location.pathname.startsWith(
        "/bibliotecario/dashboard"
      )
    )
      return "BIBLIOTECARIO";
    return "ALUNO";
  };

  const getBasePath = () => {
    if (location.pathname.startsWith("/admin"))
      return "/admin/dashboard";
    if (location.pathname.startsWith("/bibliotecario"))
      return "/bibliotecario/dashboard";
    return "/usuario";
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async (
    description: string = ""
  ) => {
    try {
      setLoading(true);
      const [categoriasRes, subcategoriasRes] =
        await Promise.all([
          categoriasService.listarTodas(description),
          api.get<Subcategoria[]>(
            API_ENDPOINTS.SUBCATEGORIAS.BASE
          ),
        ]);

      // Mapear campos do backend para o frontend
      const categoriasFormatadas = categoriasRes.map(
        (cat: any) => ({
          categoryCode: cat.categoryCode ?? cat.id,
          description:
            cat.description || cat.descricao || cat.nome,
        })
      );

      console.log(
        "Categorias formatadas:",
        categoriasFormatadas
      );
      setCategorias(categoriasFormatadas);
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
    } catch (error: any) {
      toast.error("Erro ao carregar dados", {
        description:
          error.message ||
          "Não foi possível carregar as categorias e subcategorias.",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCategoria = (categoriaId: number) => {
    const newExpanded = new Set(expandedCategorias);
    if (newExpanded.has(categoriaId)) {
      newExpanded.delete(categoriaId);
    } else {
      newExpanded.add(categoriaId);
    }
    setExpandedCategorias(newExpanded);
  };

  const handleBuscarCategorias = async () => {
    await carregarDados(descricaoBusca);
  };

  const handleLimparBusca = async () => {
    setDescricaoBusca("");
    await carregarDados("");
  };

  const getSubcategoriasPorCategoria = (
    categoriaId: number
  ) => {
    return subcategorias.filter(
      (sub) => sub.categoryCode === categoriaId
    );
  };

  // Handlers de Categoria
  const handleNovaCategoria = () => {
    setDialogMode("criar");
    setDescricaoCategoria("");
    setSelectedCategoria(null);
    setIsDialogOpen(true);
  };

  const handleEditarCategoria = (categoria: Categoria) => {
    setDialogMode("editar");
    setSelectedCategoria(categoria);
    setDescricaoCategoria(categoria.description);
    setIsDialogOpen(true);
  };

  const handleSalvarCategoria = async () => {
    if (!descricaoCategoria.trim()) {
      toast.error("Descrição da categoria é obrigatória");
      return;
    }

    try {
      if (dialogMode === "criar") {
        await api.post(API_ENDPOINTS.CATEGORIAS.BASE, {
          description: descricaoCategoria,
        });
        toast.success("Categoria criada com sucesso!");
      } else if (selectedCategoria) {
        await api.patch(
          API_ENDPOINTS.CATEGORIAS.BY_ID(
            selectedCategoria.categoryCode
          ),
          {
            description: descricaoCategoria,
          }
        );
        toast.success("Categoria atualizada com sucesso!");
      }
      setIsDialogOpen(false);
      carregarDados();
    } catch (error: any) {
      toast.error("Erro ao salvar categoria", {
        description: error.message,
      });
    }
  };

  const handleDeletarCategoria = async (
    categoria: Categoria
  ) => {
    const subs = getSubcategoriasPorCategoria(
      categoria.categoryCode
    );
    if (subs.length > 0) {
      toast.error(
        "Não é possível deletar categoria com subcategorias",
        {
          description:
            "Delete primeiro as subcategorias vinculadas.",
        }
      );
      return;
    }

    if (
      !confirm(
        `Tem certeza que deseja deletar a categoria "${categoria.description}"?`
      )
    ) {
      return;
    }

    try {
      await api.delete(
        API_ENDPOINTS.CATEGORIAS.BY_ID(
          categoria.categoryCode
        )
      );
      toast.success("Categoria deletada com sucesso!");
      carregarDados();
    } catch (error: any) {
      toast.error("Erro ao deletar categoria", {
        description: error.message,
      });
    }
  };

  // Handlers de Subcategoria
  const handleNovaSubcategoria = (categoriaId?: number) => {
    setDialogMode("criar");
    setDescricaoSubcategoria("");
    setCategoriaIdSubcategoria(categoriaId || null);
    setSelectedSubcategoria(null);
    setIsSubcategoriaDialogOpen(true);
  };

  const handleEditarSubcategoria = (
    subcategoria: Subcategoria
  ) => {
    setDialogMode("editar");
    setSelectedSubcategoria(subcategoria);
    setDescricaoSubcategoria(subcategoria.description);
    setCategoriaIdSubcategoria(subcategoria.categoryCode);
    setIsSubcategoriaDialogOpen(true);
  };

  const handleSalvarSubcategoria = async () => {
    if (!descricaoSubcategoria.trim()) {
      toast.error("Descrição da subcategoria é obrigatória");
      return;
    }
    if (!categoriaIdSubcategoria) {
      toast.error("Selecione uma categoria");
      return;
    }

    try {
      if (dialogMode === "criar") {
        await api.post(API_ENDPOINTS.SUBCATEGORIAS.BASE, {
          description: descricaoSubcategoria,
          categoryCode: categoriaIdSubcategoria,
        });
        toast.success("Subcategoria criada com sucesso!");
      } else if (selectedSubcategoria) {
        await api.patch(
          API_ENDPOINTS.SUBCATEGORIAS.BY_ID(
            selectedSubcategoria.id
          ),
          {
            description: descricaoSubcategoria,
            categoryCode: categoriaIdSubcategoria,
          }
        );
        toast.success(
          "Subcategoria atualizada com sucesso!"
        );
      }
      setIsSubcategoriaDialogOpen(false);
      carregarDados();
    } catch (error: any) {
      toast.error("Erro ao salvar subcategoria", {
        description: error.message,
      });
    }
  };

  const handleDeletarSubcategoria = async (
    subcategoria: Subcategoria
  ) => {
    if (
      !confirm(
        `Tem certeza que deseja deletar a subcategoria "${subcategoria.description}"?`
      )
    ) {
      return;
    }

    try {
      await api.delete(
        API_ENDPOINTS.SUBCATEGORIAS.BY_ID(subcategoria.id)
      );
      toast.success("Subcategoria deletada com sucesso!");
      carregarDados();
    } catch (error: any) {
      toast.error("Erro ao deletar subcategoria", {
        description: error.message,
      });
    }
  };
  // Handlers para tabela de subcategorias
  const handleNovaSubcategoriaTable = () => {
    setSelectedSubcategoriaTable(null);
    setIsSubcategoriaTableDialogOpen(true);
  };

  const handleEditarSubcategoriaTable = (
    subcategoria: SubcategoriaTable
  ) => {
    setSelectedSubcategoriaTable(subcategoria);
    setIsSubcategoriaTableDialogOpen(true);
  };

  const handleDeletarSubcategoriaTable = async (
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
      await api.delete(
        API_ENDPOINTS.SUBCATEGORIAS.BY_ID(subcategoria.id)
      );
      toast.success("Subcategoria deletada com sucesso!");
      carregarDados();
    } catch (error: any) {
      toast.error("Erro ao deletar subcategoria", {
        description: error.message,
      });
    }
  };

  const subcategoriasTableData: SubcategoriaTable[] =
    subcategorias.map((sub) => {
      const categoria = categorias.find(
        (cat) => cat.categoryCode === sub.categoryCode
      );
      return {
        id: sub.id,
        cod_subcategoria: String(sub.id),
        descricao: sub.description,
        cod_categoria_principal: sub.categoryCode,
        categoria_nome:
          categoria?.description || "N/A",
      };
    });
  if (loading) {
    return (
      <PageLayout perfil={getPerfil()}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-600"></div>
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
            { label: "Categorias e Subcategorias" },
          ]}
          backTo={getBasePath()}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-slate-100 mb-2 flex items-center gap-3">
              <FolderTree className="text-sky-600" />
              Categorias e Subcategorias
            </h1>
            <p className="text-gray-600 dark:text-slate-300">
              Gerencie a hierarquia de categorias do acervo
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleNovaCategoria} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Nova Categoria
            </Button>
            <Button
              onClick={() => handleNovaSubcategoria()}
              variant="outline"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Nova Subcategoria
            </Button>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              Estrutura de Categorias
            </CardTitle>
            <CardDescription>
              {categorias.length} categorias e{" "}
              {subcategorias.length} subcategorias
              cadastradas
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
            <div className="space-y-2">
              {categorias.map((categoria) => {
                const subs = getSubcategoriasPorCategoria(
                  categoria.categoryCode
                );
                const isExpanded = expandedCategorias.has(
                  categoria.categoryCode
                );

                return (
                  <div
                    key={categoria.categoryCode}
                    className="border rounded-lg"
                  >
                    <div className="flex items-center justify-between p-4 hover:bg-gray-50">
                      <div className="flex items-center gap-2 flex-1">
                        <button
                          onClick={() =>
                            toggleCategoria(
                              categoria.categoryCode
                            )
                          }
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                        </button>
                        <FolderTree className="h-5 w-5 text-sky-600" />
                        <div>
                          <p className="font-semibold">
                            {categoria.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            Código: {categoria.categoryCode}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-slate-400 mt-1">
                            {subs.length} subcategoria
                            {subs.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleNovaSubcategoria(
                              categoria.categoryCode
                            )
                          }
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Subcategoria
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleEditarCategoria(categoria)
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleDeletarCategoria(
                              categoria
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>

                    {isExpanded && subs.length > 0 && (
                      <div className="border-t bg-gray-50 p-4 pl-12 space-y-2 dark:border-slate-800 dark:bg-slate-900">
                        {subs.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between p-3 bg-white rounded border dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                          >
                            <div>
                              <p className="font-medium">
                                {sub.description}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-slate-400">
                                Categoria: {categoria.description}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  handleEditarSubcategoria(
                                    sub
                                  )
                                }
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  handleDeletarSubcategoria(
                                    sub
                                  )
                                }
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
                  Gerencie todas as subcategorias
                  cadastradas
                </CardDescription>
              </div>
              <Button onClick={handleNovaSubcategoriaTable}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Subcategoria
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={subcategoriaColumns(
                handleEditarSubcategoriaTable,
                handleDeletarSubcategoriaTable
              )}
              data={subcategoriasTableData}
            />
          </CardContent>
        </Card>

        {/* Dialog de Categoria */}
        <CustomModal
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        >
          <CustomModalContent
            showCloseButton
            onClose={() => setIsDialogOpen(false)}
          >
            <CustomModalHeader>
              <CustomModalTitle>
                {dialogMode === "criar"
                  ? "Nova Categoria"
                  : "Editar Categoria"}
              </CustomModalTitle>
              <CustomModalDescription>
                {dialogMode === "criar"
                  ? "Crie uma nova categoria para organizar os livros"
                  : "Atualize as informações da categoria"}
              </CustomModalDescription>
            </CustomModalHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="descricao">Descrição *</Label>
                <Input
                  id="descricao"
                  value={descricaoCategoria}
                  onChange={(e) =>
                    setDescricaoCategoria(e.target.value)
                  }
                  placeholder="Ex: Tecnologia"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSalvarCategoria}>
                  Salvar
                </Button>
              </div>
            </div>
          </CustomModalContent>
        </CustomModal>

        {/* Dialog de Subcategoria */}
        <CustomModal
          open={isSubcategoriaDialogOpen}
          onOpenChange={setIsSubcategoriaDialogOpen}
        >
          <CustomModalContent
            showCloseButton
            onClose={() =>
              setIsSubcategoriaDialogOpen(false)
            }
          >
            <CustomModalHeader>
              <CustomModalTitle>
                {dialogMode === "criar"
                  ? "Nova Subcategoria"
                  : "Editar Subcategoria"}
              </CustomModalTitle>
              <CustomModalDescription>
                {dialogMode === "criar"
                  ? "Crie uma nova subcategoria vinculada a uma categoria"
                  : "Atualize as informações da subcategoria"}
              </CustomModalDescription>
            </CustomModalHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="categoria">
                  Categoria *
                </Label>
                <Select
                  value={categoriaIdSubcategoria?.toString()}
                  onValueChange={(value) =>
                    setCategoriaIdSubcategoria(
                      parseInt(value)
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem
                        key={cat.categoryCode}
                        value={cat.categoryCode.toString()}
                      >
                        {cat.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="descricaoSub">
                  Descrição *
                </Label>
                <Input
                  id="descricaoSub"
                  value={descricaoSubcategoria}
                  onChange={(e) =>
                    setDescricaoSubcategoria(e.target.value)
                  }
                  placeholder="Ex: Programação"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    setIsSubcategoriaDialogOpen(false)
                  }
                >
                  Cancelar
                </Button>
                <Button onClick={handleSalvarSubcategoria}>
                  Salvar
                </Button>
              </div>
            </div>
          </CustomModalContent>
        </CustomModal>

        {/* Dialog de Subcategoria (Tabela) */}
        <CustomModal
          open={isSubcategoriaTableDialogOpen}
          onOpenChange={setIsSubcategoriaTableDialogOpen}
        >
          <CustomModalContent
            showCloseButton
            onClose={() =>
              setIsSubcategoriaTableDialogOpen(false)
            }
          >
            <CustomModalHeader>
              <CustomModalTitle>
                {selectedSubcategoriaTable
                  ? "Editar Subcategoria"
                  : "Nova Subcategoria"}
              </CustomModalTitle>
              <CustomModalDescription>
                {selectedSubcategoriaTable
                  ? "Atualize as informações da subcategoria"
                  : "Cadastre uma nova subcategoria"}
              </CustomModalDescription>
            </CustomModalHeader>
            <SubcategoriaForm
              subcategoria={
                selectedSubcategoriaTable
                  ? {
                      id: selectedSubcategoriaTable.id,
                      description:
                        selectedSubcategoriaTable.descricao,
                      categoryCode:
                        selectedSubcategoriaTable.cod_categoria_principal,
                    }
                  : undefined
              }
              onSuccess={() => {
                setIsSubcategoriaTableDialogOpen(false);
                carregarDados();
              }}
              onCancel={() =>
                setIsSubcategoriaTableDialogOpen(false)
              }
            />
          </CustomModalContent>
        </CustomModal>
      </div>
    </PageLayout>
  );
}



