import { Link, useLocation } from "react-router-dom";
import LogoutButton from "@/components/main/logout-button";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  UserPen,
  FileText,
  FolderTree,
  GraduationCap,
  BookCheck,
  BookmarkCheck,
  Moon,
  Sun,
  CircleDollarSign,
  UserCircle2,
} from "lucide-react";
import type { Perfil } from "@/types";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

interface MenuItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface HeaderProps {
  perfil: Perfil;
  title?: string;
  subtitle?: string;
}

const menuItemsByPerfil: Record<Perfil, MenuItem[]> = {
  ADMIN: [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="h-4 w-4 mr-2" />,
    },
    {
      label: "Livros",
      href: "/admin/livros",
      icon: <BookOpen className="h-4 w-4 mr-2" />,
    },
    {
      label: "Autores",
      href: "/admin/autores",
      icon: <UserPen className="h-4 w-4 mr-2" />,
    },
    {
      label: "Categorias",
      href: "/admin/categorias",
      icon: <FolderTree className="h-4 w-4 mr-2" />,
    },
    {
      label: "Usuários",
      href: "/admin/usuarios",
      icon: <Users className="h-4 w-4 mr-2" />,
    },
    {
      label: "Cursos",
      href: "/admin/cursos",
      icon: <GraduationCap className="h-4 w-4 mr-2" />,
    },
    {
      label: "Multas",
      href: "/admin/multas",
      icon: <CircleDollarSign className="h-4 w-4 mr-2" />,
    },
    {
      label: "Professores",
      href: "/admin/professores-por-curso",
      icon: <Users className="h-4 w-4 mr-2" />,
    },
  ],
  BIBLIOTECARIO: [
    {
      label: "Dashboard",
      href: "/bibliotecario/dashboard",
      icon: <LayoutDashboard className="h-4 w-4 mr-2" />,
    },
    {
      label: "Livros",
      href: "/bibliotecario/livros",
      icon: <BookOpen className="h-4 w-4 mr-2" />,
    },
    {
      label: "Autores",
      href: "/bibliotecario/autores",
      icon: <UserPen className="h-4 w-4 mr-2" />,
    },
    {
      label: "Categorias",
      href: "/bibliotecario/categorias",
      icon: <FolderTree className="h-4 w-4 mr-2" />,
    },
    {
      label: "Empréstimos",
      href: "/bibliotecario/emprestimos",
      icon: <BookCheck className="h-4 w-4 mr-2" />,
    },
    {
      label: "Devoluções",
      href: "/bibliotecario/devolucoes",
      icon: <BookmarkCheck className="h-4 w-4 mr-2" />,
    },
    {
      label: "Multas",
      href: "/bibliotecario/multas",
      icon: <CircleDollarSign className="h-4 w-4 mr-2" />,
    },
  ],
  USUARIO: [
    {
      label: "Catálogo",
      href: "/usuario/livros",
      icon: <BookOpen className="h-4 w-4 mr-2" />,
    },
    {
      label: "Meus Empréstimos",
      href: "/usuario/emprestimos",
      icon: <FileText className="h-4 w-4 mr-2" />,
    },
    {
      label: "Minhas Reservas",
      href: "/usuario/reservas",
      icon: <BookmarkCheck className="h-4 w-4 mr-2" />,
    },
    {
      label: "Minhas Multas",
      href: "/usuario/multas",
      icon: <CircleDollarSign className="h-4 w-4 mr-2" />,
    },
  ],
};

const mobileMenuItemsByPerfil: Record<Perfil, MenuItem[]> = {
  ADMIN: [
    {
      label: "Painel",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: "Usuários",
      href: "/admin/usuarios",
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "Cursos",
      href: "/admin/cursos",
      icon: <GraduationCap className="h-4 w-4" />,
    },
    {
      label: "Multas",
      href: "/admin/multas",
      icon: <CircleDollarSign className="h-4 w-4" />,
    },
    {
      label: "Perfil",
      href: "/admin/dashboard",
      icon: <UserCircle2 className="h-4 w-4" />,
    },
  ],
  BIBLIOTECARIO: [
    {
      label: "Catálogo",
      href: "/bibliotecario/catalogo",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      label: "Reservas",
      href: "/bibliotecario/reservas",
      icon: <BookmarkCheck className="h-4 w-4" />,
    },
    {
      label: "Empréstimos",
      href: "/bibliotecario/emprestimos",
      icon: <BookCheck className="h-4 w-4" />,
    },
    {
      label: "Multas",
      href: "/bibliotecario/multas",
      icon: <CircleDollarSign className="h-4 w-4" />,
    },
    {
      label: "Perfil",
      href: "/bibliotecario/dashboard",
      icon: <UserCircle2 className="h-4 w-4" />,
    },
  ],
  USUARIO: [
    {
      label: "Catálogo",
      href: "/usuario/livros",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      label: "Reservas",
      href: "/usuario/reservas",
      icon: <BookmarkCheck className="h-4 w-4" />,
    },
    {
      label: "Empréstimos",
      href: "/usuario/emprestimos",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      label: "Multas",
      href: "/usuario/multas",
      icon: <CircleDollarSign className="h-4 w-4" />,
    },
    {
      label: "Perfil",
      href: "/usuario",
      icon: <UserCircle2 className="h-4 w-4" />,
    },
  ],
};

const headerConfig: Record<
  Perfil,
  { title: string; subtitle: string; gradient: string }
> = {
  ADMIN: {
    title: "Painel do Administrador",
    subtitle: "Sistema de Gerenciamento de Biblioteca",
    gradient: "from-blue-600 to-indigo-600",
  },
  BIBLIOTECARIO: {
    title: "Painel do Bibliotecário",
    subtitle: "Sistema de Gerenciamento de Biblioteca",
    gradient: "from-blue-600 to-indigo-600",
  },
  USUARIO: {
    title: "Biblioteca Virtual",
    subtitle: "Sistema de Biblioteca",
    gradient: "from-blue-600 to-indigo-600",
  },
};

export function AppHeader({
  perfil,
  title,
  subtitle,
}: HeaderProps) {
  const menuItems = menuItemsByPerfil[perfil];
  const mobileMenuItems =
    mobileMenuItemsByPerfil[perfil] ?? menuItems;
  const config = headerConfig[perfil];
  const location = useLocation();
  const isActive = (href: string) => {
    return (
      location.pathname === href ||
      location.pathname.startsWith(href)
    );
  };
  const { resolvedTheme, setTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const activeIndex = mobileMenuItems.findIndex(
    (item) => isActive(item.href)
  );
  const safeActiveIndex =
    activeIndex >= 0 ? activeIndex : 0;

  return (
    <header
      id="app-header"
      className="sticky top-0 z-50 w-full border-b bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-slate-800 dark:bg-slate-950/80"
    >
      <div className="hidden lg:block">
        <div className="container mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between sm:h-16">
            {/* Logo e Título - Desktop */}
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <div
                className={`flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br ${config.gradient} shadow-lg transition-transform hover:scale-105`}
              >
                <LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1
                  className={`text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}
                >
                  {title || config.title}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden md:block dark:text-slate-400">
                  {subtitle || config.subtitle}
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {menuItems.map((item, index) => {
                const isActiveLink = isActive(item.href);
                return (
                  <Link
                    key={index}
                    to={item.href}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                      transition-all duration-200
                      ${
                        isActiveLink
                          ? "bg-blue-50 text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-300"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-slate-800 dark:hover:text-white"
                      }
                    `}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
              <div className="ml-2 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setTheme(isDarkMode ? "light" : "dark")
                  }
                  className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  aria-label={
                    isDarkMode
                      ? "Ativar tema claro"
                      : "Ativar tema escuro"
                  }
                >
                  {isDarkMode ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
                <LogoutButton />
              </div>
            </nav>

          </div>
        </div>
      </div>
      <div className="lg:hidden">
        <nav className="fixed bottom-4 left-1/2 z-40 w-[min(520px,calc(100%-2rem))] -translate-x-1/2">
          <div className="relative rounded-2xl border border-white/60 bg-white/70 px-3 py-2 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-slate-900/70">
            <span
              className="absolute inset-y-1 left-1 rounded-xl bg-blue-500/10 transition-transform duration-300 ease-out dark:bg-blue-400/10"
              style={{
                width: `calc(100% / ${mobileMenuItems.length})`,
                transform: `translateX(${safeActiveIndex * 100}%)`,
              }}
            />
            <div
              className="relative grid"
              style={{
                gridTemplateColumns: `repeat(${mobileMenuItems.length}, minmax(0, 1fr))`,
              }}
            >
              {mobileMenuItems.map((item, index) => {
                const isActiveLink = isActive(item.href);
                return (
                  <Link
                    key={index}
                    to={item.href}
                    className={`group flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-medium transition-colors duration-200 ${
                      isActiveLink
                        ? "text-blue-600 dark:text-blue-300"
                        : "text-gray-500 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white"
                    }`}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/60 text-inherit shadow-sm transition-all duration-200 group-hover:scale-105 dark:bg-slate-900/60 [&_svg]:mr-0 [&_svg]:h-5 [&_svg]:w-5">
                      {item.icon}
                    </span>
                    <span className="sr-only">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
