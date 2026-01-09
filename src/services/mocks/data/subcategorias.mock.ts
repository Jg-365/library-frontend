import type { Subcategoria } from "@/types/Filtros";

export const mockSubcategorias: Subcategoria[] = [
  {
    id: 1,
    nome: "Engenharia de Software",
    categoriaId: 1,
    descricao:
      "Livros sobre metodologias e processos de desenvolvimento",
  },
  {
    id: 2,
    nome: "Arquitetura e Padrões",
    categoriaId: 1,
    descricao:
      "Padrões de design e arquitetura de software",
  },
  {
    id: 3,
    nome: "Clean Code",
    categoriaId: 1,
    descricao: "Boas práticas e código limpo",
  },
  {
    id: 4,
    nome: "Frontend",
    categoriaId: 2,
    descricao: "Desenvolvimento web client-side",
  },
  {
    id: 5,
    nome: "Backend",
    categoriaId: 2,
    descricao: "Desenvolvimento web server-side",
  },
  {
    id: 6,
    nome: "Full Stack",
    categoriaId: 2,
    descricao: "Desenvolvimento web completo",
  },
];
