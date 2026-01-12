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
  Menu,
  Globe,
  Scale,
} from "lucide-react";
import type { Perfil } from "@/types";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { PERFIL_ROUTES } from "@/config/constants";

interface MenuItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface HeaderProps {
  perfil: Perfil;
}

const menuItemsByPerfil: Record<Perfil, MenuItem[]> = {
  ADMIN: [
    {
      label: "Livros",
      href: "/admin/livros",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      label: "Usuários",
      href: "/admin/usuarios",
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "Multas",
      href: "/admin/multas",
      icon: <CircleDollarSign className="h-4 w-4" />,
    },
  ],
  BIBLIOTECARIO: [
    {
      label: "Livros",
      href: "/bibliotecario/livros",
      icon: <BookOpen className="h-4 w-4" />,
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
      label: "Multas",
      href: "/usuario/multas",
      icon: <CircleDollarSign className="h-4 w-4" />,
    },
  ],
};

export function AppHeader({
  perfil,
}: HeaderProps) {
  const menuItems = menuItemsByPerfil[perfil];
  const location = useLocation();
  const isActive = (href: string) => {
    return (
      location.pathname === href ||
      location.pathname.startsWith(href)
    );
  };
  const { resolvedTheme, setTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  return (
    <header
      id="app-header"
      className="cyber-header-bar fixed top-0 left-0 z-50 w-full border-t border-transparent"
    >
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-3 sm:px-6 lg:px-8">
        <Link
          to={PERFIL_ROUTES[perfil]}
          className="flex items-center gap-3"
        >
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-500 shadow-[0_18px_40px_rgba(14,165,233,0.45)]">
            <Globe className="h-5 w-5 text-white" />
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-slate-900 shadow-md">
              <Scale className="h-3 w-3" />
            </span>
          </div>
          <span className="cyber-brand-mark">
            Cyber Atlas
          </span>
        </Link>

        <div className="hidden flex-1 items-center justify-between gap-4 lg:flex">
          <nav className="flex flex-wrap items-center gap-2">
            {menuItems.map((item, index) => {
              const isActiveLink = isActive(item.href);
              return (
                <Link
                  key={index}
                  to={item.href}
                  className={cn(
                    "cyber-nav-link flex items-center gap-2",
                    isActiveLink && "cyber-nav-link-active"
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setTheme(isDarkMode ? "light" : "dark")
              }
              className="text-slate-900/80 dark:text-white/70"
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
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setTheme(isDarkMode ? "light" : "dark")
            }
            className="text-slate-900/70 dark:text-white/70"
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
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-900/80 dark:text-white/70"
                aria-label="Abrir menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[280px] sm:w-[320px]">
              <SheetHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-500">
                    <Globe className="h-5 w-5 text-white" />
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-slate-900">
                      <Scale className="h-3 w-3" />
                    </span>
                  </div>
                  <span className="cyber-brand-mark text-base">
                    Cyber Atlas
                  </span>
                </div>
                <SheetTitle className="text-slate-900/80 dark:text-white/70">
                  Navegação
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-3">
                {menuItems.map((item, index) => {
                  const isActiveLink = isActive(item.href);
                  return (
                    <SheetClose asChild key={index}>
                      <Link
                        to={item.href}
                        className={cn(
                          "cyber-nav-link flex items-center w-full justify-start gap-3",
                          isActiveLink &&
                            "cyber-nav-link-active"
                        )}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    </SheetClose>
                  );
                })}
              </nav>
              <div className="mt-6 border-t border-slate-200/40 pt-4 dark:border-slate-800/60">
                <LogoutButton />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}







