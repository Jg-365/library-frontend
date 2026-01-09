import type { Curso } from "@/types/Curso";

export const mockCursos: Curso[] = [
  {
    id: 1,
    codigo: "CC001",
    nome: "Ciência da Computação",
    descricao:
      "Bacharelado em Ciência da Computação com ênfase em desenvolvimento de software",
    duracao: 8,
    nivel: "GRADUACAO",
    ativo: true,
  },
  {
    id: 2,
    codigo: "SI002",
    nome: "Sistemas de Informação",
    descricao: "Bacharelado em Sistemas de Informação",
    duracao: 8,
    nivel: "GRADUACAO",
    ativo: true,
  },
  {
    id: 3,
    codigo: "ENG003",
    nome: "Engenharia de Software",
    descricao: "Bacharelado em Engenharia de Software",
    duracao: 10,
    nivel: "GRADUACAO",
    ativo: true,
  },
  {
    id: 4,
    codigo: "TI004",
    nome: "Técnico em Informática",
    descricao: "Curso técnico em Informática para Internet",
    duracao: 3,
    nivel: "TECNICO",
    ativo: true,
  },
  {
    id: 5,
    codigo: "MBA005",
    nome: "MBA em Gestão de TI",
    descricao:
      "Pós-graduação em Gestão de Tecnologia da Informação",
    duracao: 4,
    nivel: "POS_GRADUACAO",
    ativo: true,
  },
  {
    id: 6,
    codigo: "MEST006",
    nome: "Mestrado em Computação",
    descricao:
      "Mestrado acadêmico em Ciência da Computação",
    duracao: 4,
    nivel: "MESTRADO",
    ativo: true,
  },
];
