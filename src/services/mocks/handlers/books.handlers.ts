import type MockAdapter from "axios-mock-adapter";
import { mockBooks, mockAutores } from "../data";
import { livroFormSchema } from "@/schemas/BooksSchema";
import type {
  FiltroLivros,
  ResultadoFiltroLivros,
} from "@/types/Filtros";

export function setupBooksHandlers(mock: MockAdapter) {
  // Mock para listar livros
  mock.onGet("/livros").reply(200, mockBooks);

  // Mock para filtrar livros
  mock.onGet("/livros/filtrar").reply((config) => {
    const params = new URLSearchParams(
      config.url?.split("?")[1] || ""
    );

    const filtros: FiltroLivros = {
      categoriaId: params.get("categoriaId")
        ? parseInt(params.get("categoriaId")!)
        : undefined,
      subcategoriaId: params.get("subcategoriaId")
        ? parseInt(params.get("subcategoriaId")!)
        : undefined,
      autorId: params.get("autorId")
        ? parseInt(params.get("autorId")!)
        : undefined,
      editora: params.get("editora") || undefined,
      anoMin: params.get("anoMin")
        ? parseInt(params.get("anoMin")!)
        : undefined,
      anoMax: params.get("anoMax")
        ? parseInt(params.get("anoMax")!)
        : undefined,
      disponivelApenas:
        params.get("disponivelApenas") === "true",
      termo: params.get("termo") || undefined,
    };

    let livrosFiltrados = [...mockBooks];

    // Aplicar filtros
    if (filtros.categoriaId) {
      livrosFiltrados = livrosFiltrados.filter(
        (l) => l.categoriaId === filtros.categoriaId
      );
    }

    if (filtros.subcategoriaId) {
      livrosFiltrados = livrosFiltrados.filter(
        (l) => l.subcategoriaId === filtros.subcategoriaId
      );
    }

    if (filtros.autorId) {
      livrosFiltrados = livrosFiltrados.filter((l) =>
        l.autores.some((a) => a.id === filtros.autorId)
      );
    }

    if (filtros.editora) {
      livrosFiltrados = livrosFiltrados.filter((l) =>
        l.editora
          .toLowerCase()
          .includes(filtros.editora!.toLowerCase())
      );
    }

    if (filtros.anoMin) {
      livrosFiltrados = livrosFiltrados.filter(
        (l) => l.ano >= filtros.anoMin!
      );
    }

    if (filtros.anoMax) {
      livrosFiltrados = livrosFiltrados.filter(
        (l) => l.ano <= filtros.anoMax!
      );
    }

    if (filtros.disponivelApenas) {
      livrosFiltrados = livrosFiltrados.filter(
        (l) => l.quantidadeExemplares > 0
      );
    }

    if (filtros.termo) {
      const termoLower = filtros.termo.toLowerCase();
      livrosFiltrados = livrosFiltrados.filter(
        (l) =>
          l.titulo.toLowerCase().includes(termoLower) ||
          l.isbn.toLowerCase().includes(termoLower)
      );
    }

    const resultado: ResultadoFiltroLivros = {
      livros: livrosFiltrados,
      total: livrosFiltrados.length,
      filtrosAplicados: filtros,
    };

    return [200, resultado];
  });

  // GET /livros/categoria/:categoriaId
  mock.onGet(/\/livros\/categoria\/\d+/).reply((config) => {
    const categoriaId = parseInt(
      config.url?.split("/").pop() || "0"
    );
    const livros = mockBooks.filter(
      (l) => l.categoriaId === categoriaId
    );
    return [200, livros];
  });

  // GET /livros/subcategoria/:subcategoriaId
  mock
    .onGet(/\/livros\/subcategoria\/\d+/)
    .reply((config) => {
      const subcategoriaId = parseInt(
        config.url?.split("/").pop() || "0"
      );
      const livros = mockBooks.filter(
        (l) => l.subcategoriaId === subcategoriaId
      );
      return [200, livros];
    });

  // GET /livros/autor/:autorId
  mock.onGet(/\/livros\/autor\/\d+/).reply((config) => {
    const autorId = parseInt(
      config.url?.split("/").pop() || "0"
    );
    const livros = mockBooks.filter((l) =>
      l.autores.some((a) => a.id === autorId)
    );
    return [200, livros];
  });

  // GET /livros/editora/:editora
  mock.onGet(/\/livros\/editora\/[^/]+/).reply((config) => {
    const editora = config.url?.split("/").pop() || "";
    const editoraDecoded = decodeURIComponent(editora);
    const livros = mockBooks.filter(
      (l) =>
        l.editora.toLowerCase() ===
        editoraDecoded.toLowerCase()
    );
    return [200, livros];
  });

  // GET /livros/ano/:ano
  mock.onGet(/\/livros\/ano\/\d+/).reply((config) => {
    const ano = parseInt(
      config.url?.split("/").pop() || "0"
    );
    const livros = mockBooks.filter((l) => l.ano === ano);
    return [200, livros];
  });

  // Mock para buscar livro por ID
  mock.onGet(/\/livros\/\d+/).reply((config) => {
    const id = parseInt(
      config.url?.split("/").pop() || "0"
    );
    const livro = mockBooks.find((l) => l.id === id);

    if (!livro) {
      return [404, { message: "Livro não encontrado" }];
    }

    return [200, livro];
  });

  // Mock para criar livro
  mock.onPost("/livros").reply((config) => {
    const dadosFormulario = JSON.parse(config.data);

    try {
      // Valida os dados do formulário (com array de IDs)
      livroFormSchema.parse(dadosFormulario);

      // Converte os IDs dos autores para objetos completos
      const autoresCompletos = dadosFormulario.autores
        .map((autorId: number) =>
          mockAutores.find((a) => a.id === autorId)
        )
        .filter(Boolean);

      const livroComId = {
        ...dadosFormulario,
        id: mockBooks.length + 1,
        autores: autoresCompletos,
      };

      mockBooks.push(livroComId);
      return [201, livroComId];
    } catch (error) {
      return [
        400,
        { message: "Dados do livro inválidos", error },
      ];
    }
  });

  // Mock para atualizar livro
  mock.onPut(/\/livros\/\d+/).reply((config) => {
    const id = parseInt(
      config.url?.split("/").pop() || "0"
    );
    const livroIndex = mockBooks.findIndex(
      (l) => l.id === id
    );

    if (livroIndex === -1) {
      return [404, { message: "Livro não encontrado" }];
    }

    const dadosFormulario = JSON.parse(config.data);

    try {
      // Valida os dados do formulário
      livroFormSchema.parse(dadosFormulario);

      // Converte os IDs dos autores para objetos completos
      const autoresCompletos = dadosFormulario.autores
        .map((autorId: number) =>
          mockAutores.find((a) => a.id === autorId)
        )
        .filter(Boolean);

      const livroAtualizado = {
        ...mockBooks[livroIndex],
        ...dadosFormulario,
        autores: autoresCompletos,
      };

      mockBooks[livroIndex] = livroAtualizado;
      return [200, livroAtualizado];
    } catch (error) {
      return [
        400,
        { message: "Dados do livro inválidos", error },
      ];
    }
  });

  // Mock para deletar livro
  mock.onDelete(/\/livros\/\d+/).reply((config) => {
    const id = parseInt(
      config.url?.split("/").pop() || "0"
    );
    const livroIndex = mockBooks.findIndex(
      (l) => l.id === id
    );

    if (livroIndex === -1) {
      return [404, { message: "Livro não encontrado" }];
    }

    mockBooks.splice(livroIndex, 1);
    return [204];
  });
}

