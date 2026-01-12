import { useState } from "react";
import { useLocation } from "react-router-dom";
import { PageLayout } from "@/components/layouts";
import { PageBreadcrumb } from "@/components/layouts/PageBreadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Lock,
  Key,
  UserCheck,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

export function Seguranca() {
  const [alterandoSenha, setAlterandoSenha] =
    useState(false);

  const location = useLocation();

  const getPerfil = () => {
    if (location.pathname.startsWith("/admin"))
      return "ADMIN";
    if (location.pathname.startsWith("/bibliotecario"))
      return "BIBLIOTECARIO";
    return "USUARIO";
  };
  const perfil = getPerfil();

  const configuracoes = [
    {
      id: 1,
      titulo: "Autenticação de Dois Fatores",
      descricao:
        "Adicione uma camada extra de segurança à sua conta",
      status: "Desabilitado",
      ativo: false,
      icon: Key,
    },
    {
      id: 2,
      titulo: "Notificações de Login",
      descricao:
        "Receba alertas quando houver login em sua conta",
      status: "Ativo",
      ativo: true,
      icon: UserCheck,
    },
    {
      id: 3,
      titulo: "Sessões Ativas",
      descricao:
        "Gerencie dispositivos conectados à sua conta",
      status: "2 dispositivos",
      ativo: true,
      icon: Shield,
    },
  ];

  const handleAlterarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlterandoSenha(true);

    try {
      // Simulação de alteração de senha
      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );

      toast.success("Senha alterada com sucesso!");

      // TODO: Integrar com backend para alterar senha
    } catch (error) {
      toast.error("Erro ao alterar senha");
    } finally {
      setAlterandoSenha(false);
    }
  };

  const handleToggleConfiguracao = (
    _id: number,
    titulo: string
  ) => {
    toast.info(`${titulo} será implementado em breve`);
    // TODO: Integrar com backend
  };

  return (
    <PageLayout perfil={perfil}>
      <div className="max-w-7xl mx-auto space-y-6">
        <PageBreadcrumb
          items={[
            {
              label: "Início",
              href:
                perfil === "ADMIN"
                  ? "/admin/dashboard"
                  : perfil === "BIBLIOTECARIO"
                  ? "/bibliotecario/dashboard"
                  : "/usuario",
            },
            { label: "Segurança" },
          ]}
          backTo={
            perfil === "ADMIN"
              ? "/admin/dashboard"
              : perfil === "BIBLIOTECARIO"
              ? "/bibliotecario/dashboard"
              : "/usuario"
          }
        />
        {/* Título da Página */}
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 bg-clip-text text-transparent flex items-center gap-2">
            <Shield className="h-8 w-8 text-sky-600" />
            Segurança
          </h2>
          <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">
            Gerencie as configurações de segurança da sua
            conta
          </p>
        </div>

        {/* Alerta de Segurança */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-yellow-800">
                Recomendações de Segurança
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-yellow-800">
            <p>• Altere sua senha regularmente</p>
            <p>
              • Não compartilhe suas credenciais de acesso
            </p>
            <p>
              • Habilite a autenticação de dois fatores
              quando disponível
            </p>
          </CardContent>
        </Card>

        {/* Configurações de Segurança */}
        <div>
          <h3 className="text-xl font-semibold mb-4">
            Configurações de Segurança
          </h3>
          <div className="grid gap-6">
            {configuracoes.map((config) => {
              const Icon = config.icon;
              return (
                <Card key={config.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-sky-100 rounded-lg">
                          <Icon className="h-5 w-5 text-sky-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {config.titulo}
                          </CardTitle>
                          <CardDescription>
                            {config.descricao}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={
                          config.ativo
                            ? "default"
                            : "secondary"
                        }
                        className={
                          config.ativo
                            ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-500/20 dark:text-green-200 dark:border-green-500/30"
                            : "bg-gray-100 text-gray-800 border-gray-300 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-700"
                        }
                      >
                        {config.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      onClick={() =>
                        handleToggleConfiguracao(
                          config.id,
                          config.titulo
                        )
                      }
                    >
                      Configurar
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Alterar Senha */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-sky-600" />
              <CardTitle>Alterar Senha</CardTitle>
            </div>
            <CardDescription>
              Mantenha sua conta segura alterando sua senha
              regularmente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleAlterarSenha}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="senha-atual">
                  Senha Atual
                </Label>
                <Input
                  id="senha-atual"
                  type="password"
                  placeholder="Digite sua senha atual"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nova-senha">
                  Nova Senha
                </Label>
                <Input
                  id="nova-senha"
                  type="password"
                  placeholder="Digite sua nova senha"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmar-senha">
                  Confirmar Nova Senha
                </Label>
                <Input
                  id="confirmar-senha"
                  type="password"
                  placeholder="Confirme sua nova senha"
                  required
                />
              </div>
              <Button
                type="submit"
                className="gap-2"
                disabled={alterandoSenha}
              >
                <CheckCircle className="h-4 w-4" />
                {alterandoSenha
                  ? "Alterando..."
                  : "Alterar Senha"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

export default Seguranca;



