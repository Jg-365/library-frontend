import type { Autor } from "./Autor";

export interface Livro {
  id: number;
  isbn: string;
  titulo: string;
  ano: number;
  editora: string;
  imagemCapa?: string; // URL da imagem da capa do livro

  categoriaId: number;
  subcategoriaId?: number;

  // Nomes para exibição
  categoria?: string;
  subcategoria?: string;

  descricao?: string;
  imagemUrl?: string;

  autores: Autor[];
  quantidadeExemplares: number;
}
