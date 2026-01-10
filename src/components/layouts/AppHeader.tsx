import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import LogoutButton from "@/components/main/logout-button";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  UserPen,
  FileText,
  FolderTree,
  Menu,
  GraduationCap,
  BookCheck,
  BookmarkCheck,
} from "lucide-react";
import type { Perfil } from "@/types";
import { Button } from "@/components/ui/button";
import {
  CustomSheet,
  CustomSheetContent,
  CustomSheetDescription,
  CustomSheetHeader,
  CustomSheetTitle,
  CustomSheetTrigger,
} from "@/components/ui/custom-sheet";

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
  const config = headerConfig[perfil];
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    return (
      location.pathname === href ||
      location.pathname.startsWith(href)
    );
  };

  return (
    <header
      id="app-header"
      className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo e Título - Mobile First */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br ${config.gradient} shadow-lg transition-transform hover:scale-105`}
            >
              <LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1
                className={`text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}
              >
                {title || config.title}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden md:block">
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
                        ? "bg-blue-50 text-blue-600 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
            <div className="ml-2">
              <LogoutButton />
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <CustomSheet
              open={isOpen}
              onOpenChange={setIsOpen}
            >
              <CustomSheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setIsOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">
                    Abrir menu
                  </span>
                </Button>
              </CustomSheetTrigger>
              <CustomSheetContent
                side="right"
                className="w-[300px] sm:w-[400px]"
                onClose={() => setIsOpen(false)}
              >
                <CustomSheetHeader>
                  <CustomSheetTitle className="flex items-center gap-2">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${config.gradient}`}
                    >
                      <LayoutDashboard className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-bold">
                      Menu
                    </span>
                  </CustomSheetTitle>
                  <CustomSheetDescription>
                    Navegue pelas opções do sistema
                  </CustomSheetDescription>
                </CustomSheetHeader>
                <nav className="mt-8 flex flex-col gap-2">
                  {menuItems.map((item, index) => {
                    const isActiveLink = isActive(
                      item.href
                    );
                    return (
                      <Link
                        key={index}
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-lg font-medium
                          transition-all duration-200
                          ${
                            isActiveLink
                              ? "bg-blue-50 text-blue-600 shadow-sm"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }
                        `}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    );
                  })}
                  <div className="mt-4 pt-4 border-t">
                    <LogoutButton />
                  </div>
                </nav>
              </CustomSheetContent>
            </CustomSheet>
          </div>
        </div>
      </div>
    </header>
  );
}
