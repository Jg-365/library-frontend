import UserDashboard from "@/pages/paineis/Usuario";
import BibliotecarioDashboard from "@/pages/paineis/Bibliotecario";
import CatalogoLivros from "@/pages/subpages/CatalogoLivros";
import MinhasReservas from "@/pages/subpages/MinhasReservas";
import { Navigate } from "react-router-dom";
import {
  CadastroEdicao,
  CadastroAutores,
  CadastroCategorias,
  CadastroUsuarios,
  CadastroCursos,
  CadastroEmprestimos,
  CadastroDevolucoes,
  ProfessoresPorCurso,
  AlunosPorCurso,
  MultasUsuario,
  Relatorios,
  Seguranca,
  Configuracoes,
} from "@/pages/subpages";

import type { Perfil } from "@/types";
import type { JSX } from "react";
import AdminDashboard from "@/pages/paineis/Admin";

export interface PrivateRoute {
  path: string;
  element: JSX.Element;
  perfisPermitidos: Perfil[];
}

export const privateRoutes: PrivateRoute[] = [
  // ========== ROTAS DO USUÁRIO (ALUNO/PROFESSOR) ==========
  {
    path: "/usuario/*",
    element: <UserDashboard />,
    perfisPermitidos: ["USUARIO"],
  },

  // ========== ROTAS DO BIBLIOTECÁRIO ==========
  {
    path: "/bibliotecario",
    element: (
      <Navigate to="/bibliotecario/dashboard" replace />
    ),
    perfisPermitidos: ["BIBLIOTECARIO"],
  },
  {
    path: "/bibliotecario/dashboard",
    element: <BibliotecarioDashboard />,
    perfisPermitidos: ["BIBLIOTECARIO"],
  },
  {
    path: "/bibliotecario/livros",
    element: <CadastroEdicao />,
    perfisPermitidos: ["BIBLIOTECARIO"],
  },
  {
    path: "/bibliotecario/autores",
    element: <CadastroAutores />,
    perfisPermitidos: ["BIBLIOTECARIO"],
  },
  {
    path: "/bibliotecario/categorias",
    element: <CadastroCategorias />,
    perfisPermitidos: ["BIBLIOTECARIO"],
  },
  {
    path: "/bibliotecario/emprestimos",
    element: <CadastroEmprestimos />,
    perfisPermitidos: ["BIBLIOTECARIO"],
  },
  {
    path: "/bibliotecario/devolucoes",
    element: <CadastroDevolucoes />,
    perfisPermitidos: ["BIBLIOTECARIO"],
  },
  {
    path: "/bibliotecario/multas",
    element: <MultasUsuario />,
    perfisPermitidos: ["BIBLIOTECARIO"],
  },
  {
    path: "/bibliotecario/catalogo",
    element: <CatalogoLivros />,
    perfisPermitidos: ["BIBLIOTECARIO"],
  },
  {
    path: "/bibliotecario/reservas",
    element: <MinhasReservas />,
    perfisPermitidos: ["BIBLIOTECARIO"],
  },

  // ========== ROTAS DO ADMINISTRADOR ==========
  {
    path: "/admin",
    element: <Navigate to="/admin/dashboard" replace />,
    perfisPermitidos: ["ADMIN"],
  },
  {
    path: "/admin/livros",
    element: <CadastroEdicao />,
    perfisPermitidos: ["ADMIN"],
  },
  {
    path: "/admin/dashboard",
    element: <AdminDashboard />,
    perfisPermitidos: ["ADMIN"],
  },
  {
    path: "/admin/categorias",
    element: <CadastroCategorias />,
    perfisPermitidos: ["ADMIN"],
  },
  {
    path: "/admin/autores",
    element: <CadastroAutores />,
    perfisPermitidos: ["ADMIN"],
  },
  {
    path: "/admin/usuarios",
    element: <CadastroUsuarios />,
    perfisPermitidos: ["ADMIN"],
  },
  {
    path: "/admin/cursos",
    element: <CadastroCursos />,
    perfisPermitidos: ["ADMIN"],
  },
  {
    path: "/admin/professores-por-curso",
    element: <ProfessoresPorCurso />,
    perfisPermitidos: ["ADMIN"],
  },
  {
    path: "/admin/alunos-por-curso",
    element: <AlunosPorCurso />,
    perfisPermitidos: ["ADMIN"],
  },
  {
    path: "/admin/devolucoes",
    element: <CadastroDevolucoes />,
    perfisPermitidos: ["ADMIN"],
  },
  {
    path: "/admin/multas",
    element: <MultasUsuario />,
    perfisPermitidos: ["ADMIN"],
  },
  {
    path: "/admin/catalogo",
    element: <CatalogoLivros />,
    perfisPermitidos: ["ADMIN"],
  },
  {
    path: "/admin/reservas",
    element: <MinhasReservas />,
    perfisPermitidos: ["ADMIN"],
  },
  {
    path: "/admin/relatorios",
    element: <Relatorios />,
    perfisPermitidos: ["ADMIN"],
  },
  {
    path: "/admin/configuracoes",
    element: <Configuracoes />,
    perfisPermitidos: ["ADMIN"],
  },
  {
    path: "/admin/seguranca",
    element: <Seguranca />,
    perfisPermitidos: ["ADMIN"],
  },

  // ========== ROTAS DO BIBLIOTECÁRIO (RELATÓRIOS) ==========
  {
    path: "/bibliotecario/relatorios",
    element: <Relatorios />,
    perfisPermitidos: ["BIBLIOTECARIO"],
  },
];



