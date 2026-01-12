import type { Usuario } from "@/types/Usuario";

export const mockUsers: (Usuario & {
  username: string;
  password: string;
  ativo?: boolean;
})[] = [
  {
    id: 1,
    username: "aluno1",
    password: "123456",
    nome: "João Silva",
    email: "joao.silva@email.com",
    perfil: "ALUNO",
    ativo: true,
  },
  {
    id: 2,
    username: "prof1",
    password: "123456",
    nome: "Maria Santos",
    email: "maria.santos@email.com",
    perfil: "PROFESSOR",
    ativo: true,
  },
  {
    id: 3,
    username: "biblio1",
    password: "123456",
    nome: "Pedro Costa",
    email: "pedro.costa@email.com",
    perfil: "BIBLIOTECARIO",
    ativo: true,
  },
  {
    id: 4,
    username: "admin1",
    password: "123456",
    nome: "Ana Oliveira",
    email: "ana.oliveira@email.com",
    perfil: "ADMINISTRADOR",
    ativo: true,
  },
];

