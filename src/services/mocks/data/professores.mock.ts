import type { Professor } from "@/types/Professor";
import { mockUsers } from "./users.mock";

export const mockProfessores: Professor[] = [
  {
    ...mockUsers[1], // Maria Santos - PROFESSOR
    cursoId: 1,
    departamento: "Ciência da Computação",
    titulacao: "MESTRE",
    areaEspecializacao: "Engenharia de Software",
  },
  {
    id: 5,
    nome: "Dr. Carlos Silva",
    email: "carlos.silva@universidade.com",
    perfil: "PROFESSOR",
    cursoId: 1,
    departamento: "Ciência da Computação",
    titulacao: "DOUTOR",
    areaEspecializacao: "Inteligência Artificial",
  },
  {
    id: 6,
    nome: "Profª. Ana Paula Costa",
    email: "ana.costa@universidade.com",
    perfil: "PROFESSOR",
    cursoId: 1,
    departamento: "Ciência da Computação",
    titulacao: "MESTRE",
    areaEspecializacao: "Banco de Dados",
  },
  {
    id: 7,
    nome: "Dr. Roberto Almeida",
    email: "roberto.almeida@universidade.com",
    perfil: "PROFESSOR",
    cursoId: 2,
    departamento: "Sistemas de Informação",
    titulacao: "DOUTOR",
    areaEspecializacao: "Sistemas Distribuídos",
  },
  {
    id: 8,
    nome: "Profª. Juliana Martins",
    email: "juliana.martins@universidade.com",
    perfil: "PROFESSOR",
    cursoId: 2,
    departamento: "Sistemas de Informação",
    titulacao: "ESPECIALISTA",
    areaEspecializacao: "Desenvolvimento Web",
  },
  {
    id: 9,
    nome: "Dr. Fernando Santos",
    email: "fernando.santos@universidade.com",
    perfil: "PROFESSOR",
    cursoId: 3,
    departamento: "Engenharia da Computação",
    titulacao: "POS_DOUTOR",
    areaEspecializacao: "Redes de Computadores",
  },
];
