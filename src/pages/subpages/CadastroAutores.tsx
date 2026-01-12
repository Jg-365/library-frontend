import { useLocation } from "react-router-dom";
import { AutorForm } from "@/components/forms/AutorForm";
import { PageLayout } from "@/components/layouts";
import { PageBreadcrumb } from "@/components/layouts/PageBreadcrumb";
import type { Perfil } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserPen } from "lucide-react";

export function CadastroAutores() {
  const location = useLocation();

  const getPerfil = (): Perfil => {
    if (location.pathname.startsWith("/admin")) {
      return "ADMIN";
    }
    if (location.pathname.startsWith("/bibliotecario")) {
      return "BIBLIOTECARIO";
    }
    return "USUARIO";
  };

  const getBasePath = () => {
    if (location.pathname.startsWith("/admin"))
      return "/admin/dashboard";
    if (location.pathname.startsWith("/bibliotecario"))
      return "/bibliotecario/dashboard";
    return "/usuario";
  };

  return (
    <PageLayout perfil={getPerfil()}>
      <div className="max-w-7xl mx-auto">
        <PageBreadcrumb
          items={[
            { label: "Início", href: getBasePath() },
            { label: "Cadastro de Autores" },
          ]}
          backTo={getBasePath()}
        />
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <UserPen className="h-5 w-5 text-sky-600" />
              Cadastro de Autores
            </CardTitle>
            <CardDescription>
              Adicione novos autores ao sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AutorForm className="space-y-6 w-full" />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

export default CadastroAutores;



