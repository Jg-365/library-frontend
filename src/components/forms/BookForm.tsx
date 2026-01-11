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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  autoresService,
  categoriasService,
  subcategoriasService,
} from "@/services";
import type { Livro, Autor, Categoria } from "@/types";
import type { Subcategoria } from "@/types/Filtros";
import type {
  BookRequest,
  BookRequestUpdate,
} from "@/types/BackendRequests";
import {
  livroFormSchema,
  type LivroFormValues,
} from "@/schemas";
import { livrosService } from "@/services/livrosService";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getErrorMessage } from "@/lib/errorMessage";

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
  const [coautoresParaRemover, setCoautoresParaRemover] =
    useState<string[]>([]);

  // Google Books suggestions (UX improvement)
  const [googleSuggestions, setGoogleSuggestions] =
    useState<any[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] =
    useState(false);

  async function fetchGoogleBooks(query: string) {
    try {
      setSuggestionsLoading(true);
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
          query
        )}&maxResults=6`
      );
      const json = await res.json();
      const items = json.items || [];
      const parsed = items.map((it: any) => {
        const info = it.volumeInfo || {};
        const industry = info.industryIdentifiers || [];
        const isbnObj = industry.find((id: any) =>
          id.type?.toLowerCase().includes("isbn")
        );
        return {
          id: it.id,
          title: info.title,
          authors: info.authors || [],
          publisher: info.publisher,
          publishedDate: info.publishedDate,
          isbn: isbnObj ? isbnObj.identifier : undefined,
        };
      });
      setGoogleSuggestions(parsed);
    } catch (err) {
      console.error("Erro Google Books:", err);
      setGoogleSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  }

  function applySuggestion(suggestion: any) {
    if (!suggestion) return;
    form.setValue("titulo", suggestion.title || "");
    if (suggestion.isbn)
      form.setValue("isbn", suggestion.isbn);
    if (suggestion.publisher)
      form.setValue("editora", suggestion.publisher);
    if (suggestion.publishedDate) {
      const year = Number(
        String(suggestion.publishedDate).slice(0, 4)
      );
      if (!isNaN(year)) form.setValue("ano", year);
    }

    // Try to match authors by name with existing authors list
    if (
      suggestion.authors &&
      suggestion.authors.length > 0
    ) {
      const matched = suggestion.authors
        .map((name: string) =>
          autores.find(
            (a) =>
              a.nome?.toLowerCase() === name.toLowerCase()
          )
        )
        .filter(Boolean) as Autor[];
      if (matched.length > 0) {
        setSelectedAutores(matched);
        form.setValue(
          "autores",
          matched.map((m) => m.id)
        );
      }
    }

    // collapse suggestions after apply
    setGoogleSuggestions([]);
  }

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

  const tituloValue = form.watch("titulo");

  useEffect(() => {
    const handler = setTimeout(() => {
      if (tituloValue && tituloValue.length >= 3) {
        fetchGoogleBooks(tituloValue);
      } else {
        setGoogleSuggestions([]);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [tituloValue]);

  useEffect(() => {
    carregarAutores();
    carregarCategorias();
    if (livro) {
      setSelectedAutores(livro.autores || []);
      setCoautoresParaRemover([]);
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
      const autoresFormatados =
        await autoresService.listarTodos();
      setAutores(autoresFormatados);
    } catch (error) {
      toast.error("Erro ao carregar autores");
      console.error("Erro ao carregar autores:", error);
    }
  };

  const carregarCategorias = async () => {
    try {
      const categoriasResponse =
        await categoriasService.listarTodas("");
      console.log("Categorias carregadas:", categoriasResponse);
      console.log(
        "Primeira categoria:",
        categoriasResponse[0]
      );

      // Mapear resposta para o formato usado no frontend
      const categoriasFormatadas =
        categoriasResponse.map((cat: any) => ({
          categoryCode: cat.categoryCode ?? cat.id,
          description:
            cat.description || cat.descricao || cat.nome,
        }));
      console.log(
        "Primeira categoria formatada:",
        categoriasFormatadas[0]
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
      const response =
        await subcategoriasService.listarPorCategoria(
          categoriaId
        );

      console.log(
        "✅ Subcategorias carregadas (raw):",
        response
      );

      const subcategoriasFormatadas = response
        .map((sub: any) => {
          console.log("🔍 Mapeando subcategoria:", sub);
          return {
            id: sub.id || sub.subcategoryCode,
            description:
              sub.description || sub.name || sub.nome,
            categoryCode:
              sub.category?.categoryCode ||
              sub.categoryCode ||
              sub.categoriaId,
          };
        })
        .filter((sub: any) => {
          const isValid = sub.id && sub.description;
          console.log(
            `🔍 Subcategoria ${sub.description} válida?`,
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

  const handleToggleCoautor = (email: string) => {
    setCoautoresParaRemover((prev) =>
      prev.includes(email)
        ? prev.filter((item) => item !== email)
        : [...prev, email]
    );
  };

  const handleRemoverCoautores = async () => {
    if (!livro) return;

    const emailsValidos = coautoresParaRemover.filter(
      (email) => email && email.includes("@")
    );

    if (emailsValidos.length === 0) {
      toast.error("Selecione ao menos um coautor válido");
      return;
    }

    try {
      setIsLoading(true);
      await livrosService.removerCoautores(
        livro.isbn,
        emailsValidos
      );

      const autoresAtualizados = selectedAutores.filter(
        (autor, index) =>
          index === 0 ||
          !emailsValidos.includes(autor.email || "")
      );

      setSelectedAutores(autoresAtualizados);
      form.setValue(
        "autores",
        autoresAtualizados.map((autor) => autor.id)
      );
      setCoautoresParaRemover([]);
      toast.success("Coautores removidos com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao remover coautores", {
        description:
          getErrorMessage(
            error.response?.data?.message ||
              error.message,
            "Tente novamente"
          ),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: LivroFormValues) => {
    try {
      setIsLoading(true);

      console.log("📚 Dados do formulário:", data);

      // Transformar dados para o formato que o backend espera
      const autoresSelecionados = selectedAutores.filter(
        (autor) => data.autores.includes(autor.id)
      );
      const [autorPrincipal, ...coAutores] =
        autoresSelecionados;

      const emailAuthor = autorPrincipal?.email || "";
      const coAuthorsEmails = Array.from(
        new Set(
          coAutores
            .map((autor) => autor.email)
            .filter(
              (email): email is string =>
                typeof email === "string" &&
                email.length > 0 &&
                email !== emailAuthor
            )
        )
      );

      if (livro) {
        // Editar livro existente
        // Nota: ISBN não pode ser alterado (chave primária imutável)
        const updatePayload: BookRequestUpdate = {
          title: data.titulo,
          releaseYear: data.ano,
          publisher: data.editora,
          subCategoryId: data.subcategoriaId,
          emailAuthor,
          coAuthorsEmails,
        };

        console.log(
          "🔄 Atualizando livro com ISBN:",
          livro.isbn
        );
        console.log(
          "📤 Update Payload:",
          JSON.stringify(updatePayload, null, 2)
        );

        await livrosService.atualizar(
          livro.isbn,
          updatePayload
        );
        toast.success("Livro atualizado com sucesso!");
      } else {
        // Criar novo livro
        const createPayload: BookRequest = {
          isbn: data.isbn,
          title: data.titulo,
          releaseYear: data.ano,
          publisher: data.editora,
          subCategoryId: data.subcategoriaId,
          emailAuthor,
          coAuthorsEmails,
        };

        console.log("\u2795 Criando novo livro");
        console.log(
          "\ud83d\udce4 Create Payload:",
          JSON.stringify(createPayload, null, 2)
        );

        await livrosService.criar(createPayload);
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
            getErrorMessage(
              error.response?.data?.message ||
                error.response?.data?.error,
              "Tente novamente"
            ),
          duration: 10000,
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const coautoresDisponiveis = selectedAutores.slice(1);

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
                {/* Google Books suggestions dropdown */}
                {suggestionsLoading && (
                  <div className="mt-2 text-sm text-gray-500">
                    Buscando sugestões...
                  </div>
                )}
                {googleSuggestions.length > 0 && (
                  <div className="mt-2 border rounded bg-white shadow-sm max-h-56 overflow-auto">
                    {googleSuggestions.map((sug) => (
                      <button
                        key={sug.id}
                        type="button"
                        onClick={() => applySuggestion(sug)}
                        className="w-full text-left p-2 hover:bg-gray-50"
                      >
                        <div className="font-medium">
                          {sug.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {(sug.authors || []).join(", ")}
                          {sug.isbn ? ` • ${sug.isbn}` : ""}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
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
                (categoria) => categoria?.categoryCode
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
                              key={categoria.categoryCode}
                              value={categoria.categoryCode.toString()}
                            >
                              {categoria.description}
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
                        s.categoryCode ===
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
                                  s.categoryCode ===
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
                            sub.categoryCode ===
                              form.watch("categoriaId")
                        )
                        .map((subcategoria) => (
                          <SelectItem
                            key={subcategoria.id}
                            value={subcategoria.id.toString()}
                          >
                            {subcategoria.description}
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

          {livro && coautoresDisponiveis.length > 0 && (
            <div className="md:col-span-2 space-y-3 rounded-lg border border-dashed p-4">
              <FormLabel>Remover coautores</FormLabel>
              <div className="space-y-2">
                {coautoresDisponiveis.map((autor) => {
                  const email = autor.email || "";
                  const isDisabled = !email;
                  return (
                    <label
                      key={autor.id}
                      className="flex items-center gap-3 text-sm"
                    >
                      <Checkbox
                        checked={
                          !isDisabled &&
                          coautoresParaRemover.includes(
                            email
                          )
                        }
                        disabled={isDisabled}
                        onCheckedChange={() => {
                          if (!isDisabled) {
                            handleToggleCoautor(email);
                          }
                        }}
                      />
                      <span className="font-medium">
                        {autor.nome}
                      </span>
                      <span className="text-muted-foreground">
                        {email || "Email não informado"}
                      </span>
                    </label>
                  );
                })}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleRemoverCoautores}
                disabled={
                  isLoading ||
                  coautoresParaRemover.length === 0
                }
              >
                Remover coautores selecionados
              </Button>
            </div>
          )}
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
