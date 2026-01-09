import type Livro from "./Livro";
import type { Autor } from "./Autor";
import type { Categoria } from "./Categoria";

export interface FiltroLivros {
  categoriaId?: number;
  subcategoriaId?: number;
  autorId?: number;
  editora?: string;
  anoMin?: number;
  anoMax?: number;
  disponivelApenas?: boolean;
  termo?: string; // Busca geral (título, ISBN)
}

export interface ResultadoFiltroLivros {
  livros: Livro[];
  total: number;
  filtrosAplicados: FiltroLivros;
}

export interface Subcategoria {
  id: number;
  nome: string;
  categoriaId: number;
  descricao?: string;
}

export interface SubcategoriaComCategoria
  extends Subcategoria {
  categoria?: Categoria;
}
