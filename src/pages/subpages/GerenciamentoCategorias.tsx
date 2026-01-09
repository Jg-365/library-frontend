import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "@/services/api";
import type {
  Categoria,
  Subcategoria,
  Perfil,
} from "@/types";
import { API_ENDPOINTS } from "@/config";
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

  // Form states
  const [nomeCategoria, setNomeCategoria] = useState("");
  const [descricaoCategoria, setDescricaoCategoria] =
    useState("");
  const [nomeSubcategoria, setNomeSubcategoria] =
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

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [categoriasRes, subcategoriasRes] =
        await Promise.all([
          api.get<Categoria[]>(
            `${API_ENDPOINTS.CATEGORIAS.BASE}?description=`
          ),
          api.get<Subcategoria[]>(
            API_ENDPOINTS.SUBCATEGORIAS.BASE
          ),
        ]);

      // Mapear campos do backend para o frontend
      const categoriasFormatadas = categoriasRes.data.map(
        (cat: any) => ({
          id: cat.categoryCode || cat.id,
          codigo: cat.categoryCode || cat.codigo,
          nome: cat.description || cat.nome,
          descricao: cat.description || cat.descricao,
        })
      );

      console.log(
        "Categorias formatadas:",
        categoriasFormatadas
      );
      setCategorias(categoriasFormatadas);
      setSubcategorias(subcategoriasRes.data);
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

  const getSubcategoriasPorCategoria = (
    categoriaId: number
  ) => {
    return subcategorias.filter(
      (sub) => sub.categoriaId === categoriaId
    );
  };

  // Handlers de Categoria
  const handleNovaCategoria = () => {
    setDialogMode("criar");
    setNomeCategoria("");
    setDescricaoCategoria("");
    setSelectedCategoria(null);
    setIsDialogOpen(true);
  };

  const handleEditarCategoria = (categoria: Categoria) => {
    setDialogMode("editar");
    setSelectedCategoria(categoria);
    setNomeCategoria(categoria.nome);
    setDescricaoCategoria(categoria.descricao || "");
    setIsDialogOpen(true);
  };

  const handleSalvarCategoria = async () => {
    if (!nomeCategoria.trim()) {
      toast.error("Nome da categoria é obrigatório");
      return;
    }

    try {
      if (dialogMode === "criar") {
        await api.post(API_ENDPOINTS.CATEGORIAS.BASE, {
          nome: nomeCategoria,
          descricao: descricaoCategoria,
        });
        toast.success("Categoria criada com sucesso!");
      } else if (selectedCategoria) {
        await api.put(
          API_ENDPOINTS.CATEGORIAS.BY_ID(
            selectedCategoria.id
          ),
          {
            nome: nomeCategoria,
            descricao: descricaoCategoria,
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
    const subs = getSubcategoriasPorCategoria(categoria.id);
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
        `Tem certeza que deseja deletar a categoria "${categoria.nome}"?`
      )
    ) {
      return;
    }

    try {
      await api.delete(
        API_ENDPOINTS.CATEGORIAS.BY_ID(categoria.id)
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
    setNomeSubcategoria("");
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
    setNomeSubcategoria(subcategoria.nome);
    setDescricaoSubcategoria(subcategoria.descricao || "");
    setCategoriaIdSubcategoria(subcategoria.categoriaId);
    setIsSubcategoriaDialogOpen(true);
  };

  const handleSalvarSubcategoria = async () => {
    if (!nomeSubcategoria.trim()) {
      toast.error("Nome da subcategoria é obrigatório");
      return;
    }
    if (!categoriaIdSubcategoria) {
      toast.error("Selecione uma categoria");
      return;
    }

    try {
      if (dialogMode === "criar") {
        await api.post(API_ENDPOINTS.SUBCATEGORIAS.BASE, {
          nome: nomeSubcategoria,
          descricao: descricaoSubcategoria,
          categoriaId: categoriaIdSubcategoria,
        });
        toast.success("Subcategoria criada com sucesso!");
      } else if (selectedSubcategoria) {
        await api.put(
          API_ENDPOINTS.SUBCATEGORIAS.BY_ID(
            selectedSubcategoria.id
          ),
          {
            nome: nomeSubcategoria,
            descricao: descricaoSubcategoria,
            categoriaId: categoriaIdSubcategoria,
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
        `Tem certeza que deseja deletar a subcategoria "${subcategoria.nome}"?`
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
        (cat) => cat.id === sub.categoriaId
      );
      return {
        id: sub.id,
        cod_subcategoria: sub.codigo || String(sub.id),
        descricao: sub.nome || sub.descricao,
        cod_categoria_principal: sub.categoriaId,
        categoria_nome:
          categoria?.nome || categoria?.descricao || "N/A",
      };
    });
  if (loading) {
    return (
      <PageLayout perfil={getPerfil()}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
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
            <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <FolderTree className="text-blue-600" />
              Categorias e Subcategorias
            </h1>
            <p className="text-gray-600">
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
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categorias.map((categoria) => {
                const subs = getSubcategoriasPorCategoria(
                  categoria.id
                );
                const isExpanded = expandedCategorias.has(
                  categoria.id
                );

                return (
                  <div
                    key={categoria.id}
                    className="border rounded-lg"
                  >
                    <div className="flex items-center justify-between p-4 hover:bg-gray-50">
                      <div className="flex items-center gap-2 flex-1">
                        <button
                          onClick={() =>
                            toggleCategoria(categoria.id)
                          }
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                        </button>
                        <FolderTree className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-semibold">
                            {categoria.nome}
                          </p>
                          {categoria.descricao && (
                            <p className="text-sm text-gray-500">
                              {categoria.descricao}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
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
                              categoria.id
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
                      <div className="border-t bg-gray-50 p-4 pl-12 space-y-2">
                        {subs.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between p-3 bg-white rounded border"
                          >
                            <div>
                              <p className="font-medium">
                                {sub.nome}
                              </p>
                              {sub.descricao && (
                                <p className="text-sm text-gray-500">
                                  {sub.descricao}
                                </p>
                              )}
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
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={nomeCategoria}
                  onChange={(e) =>
                    setNomeCategoria(e.target.value)
                  }
                  placeholder="Ex: Tecnologia"
                />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={descricaoCategoria}
                  onChange={(e) =>
                    setDescricaoCategoria(e.target.value)
                  }
                  placeholder="Descrição da categoria"
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
                        key={cat.id}
                        value={cat.id.toString()}
                      >
                        {cat.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="nomeSub">Nome *</Label>
                <Input
                  id="nomeSub"
                  value={nomeSubcategoria}
                  onChange={(e) =>
                    setNomeSubcategoria(e.target.value)
                  }
                  placeholder="Ex: Programação"
                />
              </div>
              <div>
                <Label htmlFor="descricaoSub">
                  Descrição
                </Label>
                <Input
                  id="descricaoSub"
                  value={descricaoSubcategoria}
                  onChange={(e) =>
                    setDescricaoSubcategoria(e.target.value)
                  }
                  placeholder="Descrição da subcategoria"
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
                selectedSubcategoriaTable || undefined
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
