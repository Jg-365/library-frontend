import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/services/api";
import type { Livro, Autor, Categoria } from "@/types";
import type { Subcategoria } from "@/types/Filtros";
import {
  livroFormSchema,
  type LivroFormValues,
} from "@/schemas";
import { API_ENDPOINTS } from "@/config";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BookFormProps {
  livro?: Livro;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BookForm({
  livro,
  onSuccess,
  onCancel,
}: BookFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [autores, setAutores] = useState<Autor[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>(
    []
  );
  const [subcategorias, setSubcategorias] = useState<
    Subcategoria[]
  >([]);
  const [selectedAutores, setSelectedAutores] = useState<
    Autor[]
  >([]);

  const form = useForm<LivroFormValues>({
    resolver: zodResolver(livroFormSchema),
    defaultValues: {
      titulo: livro?.titulo || "",
      isbn: livro?.isbn || "",
      editora: livro?.editora || "",
      ano: livro?.ano || new Date().getFullYear(),
      categoriaId: livro?.categoriaId || 0,
      subcategoriaId: livro?.subcategoriaId || 0,
      autores: livro?.autores?.map((a) => a.id) || [],
    },
  });

  useEffect(() => {
    carregarAutores();
    carregarCategorias();
    if (livro) {
      setSelectedAutores(livro.autores || []);
    }

    // Recarregar autores quando a janela volta a ter foco
    const handleFocus = () => {
      carregarAutores();
      carregarCategorias();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [livro]);

  const carregarAutores = async () => {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.AUTORES.BASE}/all`
      );
      console.log("Autores carregados:", response.data);
      console.log("Primeiro autor:", response.data[0]);

      // Mapear name para nome e criar id se não existir
      const autoresFormatados = response.data.map(
        (autor: any, index: number) => ({
          id: autor.id || autor.authorId || index + 1, // Tentar id, authorId ou usar índice
          nome: autor.name || autor.nome,
          email: autor.email,
          nacionalidade:
            autor.nationality || autor.nacionalidade,
        })
      );

      console.log("Autores formatados:", autoresFormatados);
      setAutores(autoresFormatados);
    } catch (error) {
      toast.error("Erro ao carregar autores");
      console.error("Erro ao carregar autores:", error);
    }
  };

  const carregarCategorias = async () => {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.CATEGORIAS.BASE}?description=`
      );
      console.log("Categorias carregadas:", response.data);
      console.log("Primeira categoria:", response.data[0]);

      // Mapear categoryCode para id
      const categoriasFormatadas = response.data.map(
        (cat: any) => ({
          id: cat.categoryCode,
          descricao: cat.description,
        })
      );

      console.log(
        "Categorias formatadas:",
        categoriasFormatadas
      );
      setCategorias(categoriasFormatadas);
    } catch (error) {
      toast.error("Erro ao carregar categorias");
      console.error("Erro ao carregar categorias:", error);
    }
  };

  const carregarSubcategorias = async (
    categoriaId: number
  ) => {
    try {
      console.log(
        "🔍 Carregando subcategorias para categoria:",
        categoriaId
      );
      const url = `${API_ENDPOINTS.SUBCATEGORIAS.BASE}?categoryCode=${categoriaId}`;
      console.log("🔍 URL:", url);

      const response = await api.get(url);
      console.log(
        "✅ Subcategorias carregadas (raw):",
        response.data
      );

      const subcategoriasFormatadas = response.data
        .map((sub: any) => {
          console.log("🔍 Mapeando subcategoria:", sub);
          return {
            id: sub.id || sub.subcategoryCode,
            nome: sub.description || sub.name || sub.nome,
            categoriaId:
              sub.category?.categoryCode ||
              sub.categoryCode ||
              sub.categoriaId,
          };
        })
        .filter((sub: any) => {
          const isValid = sub.id && sub.nome;
          console.log(
            `🔍 Subcategoria ${sub.nome} válida?`,
            isValid
          );
          return isValid;
        });

      console.log(
        "✅ Subcategorias formatadas:",
        subcategoriasFormatadas
      );
      setSubcategorias(subcategoriasFormatadas);
    } catch (error) {
      console.error(
        "❌ Erro ao carregar subcategorias:",
        error
      );
      toast.error("Erro ao carregar subcategorias");
      setSubcategorias([]);
    }
  };

  const handleAddAutor = (autorId: string) => {
    const id = parseInt(autorId);
    const autor = autores.find((a) => a.id === id);
    if (
      autor &&
      !selectedAutores.find((a) => a.id === id)
    ) {
      const newSelectedAutores = [
        ...selectedAutores,
        autor,
      ];
      setSelectedAutores(newSelectedAutores);
      form.setValue(
        "autores",
        newSelectedAutores.map((a) => a.id)
      );
    }
  };

  const handleRemoveAutor = (autorId: number) => {
    const newSelectedAutores = selectedAutores.filter(
      (a) => a.id !== autorId
    );
    setSelectedAutores(newSelectedAutores);
    form.setValue(
      "autores",
      newSelectedAutores.map((a) => a.id)
    );
  };

  const onSubmit = async (data: LivroFormValues) => {
    try {
      setIsLoading(true);

      console.log("📚 Dados do formulário:", data);

      // Transformar dados para o formato que o backend espera
      const autorPrincipal = autores.find(
        (a) => a.id === data.autores[0]
      );

      if (livro) {
        // Editar livro existente
        // Nota: ISBN não pode ser alterado (chave primária imutável)
        // BookRequestUpdate aceita: title, releaseYear, publisher, subCategoryId, emailAuthor
        const updatePayload = {
          title: data.titulo,
          releaseYear: data.ano,
          publisher: data.editora,
          subCategoryId: data.subcategoriaId,
          emailAuthor: autorPrincipal?.email || "",
        };

        console.log(
          "🔄 Atualizando livro com ISBN:",
          livro.isbn
        );
        console.log(
          "📤 Update Payload:",
          JSON.stringify(updatePayload, null, 2)
        );

        await api.patch(
          API_ENDPOINTS.LIVROS.UPDATE(livro.isbn),
          updatePayload
        );
        toast.success("Livro atualizado com sucesso!");
      } else {
        // Criar novo livro
        // BookRequest aceita: isbn, title, releaseYear, publisher, subCategoryId, emailAuthor, coAuthorsEmails
        const createPayload = {
          isbn: data.isbn,
          title: data.titulo,
          releaseYear: data.ano,
          publisher: data.editora,
          idSubCategory: data.subcategoriaId, // Backend espera idSubCategory, não subCategoryId
          emailAuthor: autorPrincipal?.email || "",
          coAuthorsEmails: [], // Lista vazia por enquanto
        };

        console.log("\u2795 Criando novo livro");
        console.log(
          "\ud83d\udce4 Create Payload:",
          JSON.stringify(createPayload, null, 2)
        );

        await api.post(
          API_ENDPOINTS.LIVROS.BASE,
          createPayload
        );
        toast.success("Livro cadastrado com sucesso!");
      }

      onSuccess?.();
    } catch (error: any) {
      console.error(
        "❌ Erro completo ao cadastrar livro:",
        error
      );
      console.error(
        "❌ Response data:",
        error.response?.data
      );
      console.error(
        "❌ Response status:",
        error.response?.status
      );
      toast.error(
        livro
          ? "Erro ao atualizar livro"
          : "Erro ao cadastrar livro",
        {
          description:
            error.response?.data?.message ||
            error.response?.data?.error ||
            "Tente novamente",
          duration: 10000,
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {!livro && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-medium mb-1">
              ℹ️ Informação sobre exemplares
            </p>
            <p>
              Após cadastrar o livro, você poderá adicionar
              exemplares físicos (cópias) através do
              gerenciamento de cópias.
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Título */}
          <FormField
            control={form.control}
            name="titulo"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Título *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Digite o título do livro"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ISBN */}
          <FormField
            control={form.control}
            name="isbn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  ISBN *
                  {livro && (
                    <span className="text-xs text-muted-foreground ml-2">
                      (não editável)
                    </span>
                  )}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="978-3-16-148410-0"
                    {...field}
                    disabled={!!livro}
                    className={
                      livro
                        ? "bg-muted cursor-not-allowed"
                        : ""
                    }
                  />
                </FormControl>
                {livro && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ⚠️ O ISBN é a chave primária e não pode
                    ser alterado. Para mudar o ISBN, exclua
                    este livro e cadastre um novo.
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Editora */}
          <FormField
            control={form.control}
            name="editora"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Editora *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nome da editora"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Ano */}
          <FormField
            control={form.control}
            name="ano"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ano de Publicação *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        parseInt(e.target.value)
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Categoria */}
          <FormField
            control={form.control}
            name="categoriaId"
            render={({ field }) => {
              console.log(
                "Renderizando categoria, categorias:",
                categorias
              );
              console.log("Field value:", field.value);
              const categoriasValidas = categorias.filter(
                (categoria) => categoria?.id
              );
              console.log(
                "Categorias após filtro:",
                categoriasValidas
              );
              return (
                <FormItem>
                  <FormLabel>Categoria *</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      console.log(
                        "Categoria selecionada:",
                        value
                      );
                      const categoriaId = parseInt(value);
                      field.onChange(categoriaId);
                      // Carregar subcategorias da categoria selecionada
                      carregarSubcategorias(categoriaId);
                      // Resetar subcategoria selecionada
                      form.setValue("subcategoriaId", 0);
                    }}
                    value={
                      field.value && field.value !== 0
                        ? field.value.toString()
                        : undefined
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categorias.length === 0 ? (
                        <SelectItem value="0" disabled>
                          Nenhuma categoria disponível
                        </SelectItem>
                      ) : (
                        categoriasValidas.map(
                          (categoria) => (
                            <SelectItem
                              key={categoria.id}
                              value={categoria.id.toString()}
                            >
                              {categoria.descricao}
                            </SelectItem>
                          )
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          {/* Subcategoria */}
          <FormField
            control={form.control}
            name="subcategoriaId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subcategoria *</FormLabel>
                <Select
                  onValueChange={(value) =>
                    field.onChange(parseInt(value))
                  }
                  value={
                    field.value && field.value !== 0
                      ? field.value.toString()
                      : ""
                  }
                  disabled={
                    !form.watch("categoriaId") ||
                    subcategorias.filter(
                      (s) =>
                        s.categoriaId ===
                        form.watch("categoriaId")
                    ).length === 0
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          !form.watch("categoriaId")
                            ? "Selecione uma categoria primeiro"
                            : subcategorias.filter(
                                (s) =>
                                  s.categoriaId ===
                                  form.watch("categoriaId")
                              ).length === 0
                            ? "Nenhuma subcategoria cadastrada. Cadastre uma nova."
                            : "Selecione uma subcategoria"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subcategorias.length === 0 ? (
                      <SelectItem value="0" disabled>
                        {!form.watch("categoriaId")
                          ? "Selecione uma categoria primeiro"
                          : "Nenhuma subcategoria cadastrada. Cadastre uma nova."}
                      </SelectItem>
                    ) : (
                      subcategorias
                        .filter(
                          (sub) =>
                            sub?.id &&
                            sub.categoriaId ===
                              form.watch("categoriaId")
                        )
                        .map((subcategoria) => (
                          <SelectItem
                            key={subcategoria.id}
                            value={subcategoria.id.toString()}
                          >
                            {subcategoria.nome}
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Autores */}
          <div className="md:col-span-2 space-y-3">
            <FormLabel>Autores *</FormLabel>
            <Select onValueChange={handleAddAutor}>
              <SelectTrigger>
                <SelectValue placeholder="Adicionar autor" />
              </SelectTrigger>
              <SelectContent>
                {(() => {
                  console.log(
                    "Autores antes do filtro:",
                    autores
                  );
                  console.log(
                    "Autores selecionados:",
                    selectedAutores
                  );
                  const autoresFiltrados = autores.filter(
                    (a) => {
                      const jaAdicionado =
                        selectedAutores.find(
                          (sa) => sa.id === a.id
                        );
                      console.log(
                        `Autor ${a.nome} (id: ${
                          a.id
                        }) - Já adicionado: ${!!jaAdicionado}`
                      );
                      return a?.id && !jaAdicionado;
                    }
                  );
                  console.log(
                    "Autores após filtro:",
                    autoresFiltrados
                  );
                  return autoresFiltrados.map((autor) => (
                    <SelectItem
                      key={autor.id}
                      value={autor.id.toString()}
                    >
                      {autor.nome}
                    </SelectItem>
                  ));
                })()}
              </SelectContent>
            </Select>

            {selectedAutores.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedAutores.map((autor) => (
                  <Badge
                    key={autor.id}
                    variant="secondary"
                    className="gap-2 pr-1"
                  >
                    {autor.nome}
                    <button
                      type="button"
                      className="ml-1 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveAutor(autor.id);
                      }}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-red-600" />
                      <span className="sr-only">
                        Remover
                      </span>
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {form.formState.errors.autores && (
              <p className="text-sm text-red-600">
                {form.formState.errors.autores.message}
              </p>
            )}
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {livro ? "Atualizar" : "Cadastrar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
