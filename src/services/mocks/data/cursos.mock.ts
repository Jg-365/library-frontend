import type { Curso } from "@/types/Curso";

export const mockCursos: Curso[] = [
  {
    courseCode: 1,
    courseName: "Ciência da Computação",
    id: 1,
    codigo: "CC001",
    descricao:
      "Bacharelado em Ciência da Computação com ênfase em desenvolvimento de software",
    duracao: 8,
    nivel: "GRADUACAO",
    ativo: true,
  },
  {
    courseCode: 2,
    courseName: "Sistemas de Informação",
    id: 2,
    codigo: "SI002",
    descricao: "Bacharelado em Sistemas de Informação",
    duracao: 8,
    nivel: "GRADUACAO",
    ativo: true,
  },
  {
    courseCode: 3,
    courseName: "Engenharia de Software",
    id: 3,
    codigo: "ENG003",
    descricao: "Bacharelado em Engenharia de Software",
    duracao: 10,
    nivel: "GRADUACAO",
    ativo: true,
  },
  {
    courseCode: 4,
    courseName: "Técnico em Informática",
    id: 4,
    codigo: "TI004",
    descricao: "Curso técnico em Informática para Internet",
    duracao: 3,
    nivel: "TECNICO",
    ativo: true,
  },
  {
    courseCode: 5,
    courseName: "MBA em Gestão de TI",
    id: 5,
    codigo: "MBA005",
    descricao:
      "Pós-graduação em Gestão de Tecnologia da Informação",
    duracao: 4,
    nivel: "POS_GRADUACAO",
    ativo: true,
  },
  {
    courseCode: 6,
    courseName: "Mestrado em Computação",
    id: 6,
    codigo: "MEST006",
    descricao:
      "Mestrado acadêmico em Ciência da Computação",
    duracao: 4,
    nivel: "MESTRADO",
    ativo: true,
  },
];

