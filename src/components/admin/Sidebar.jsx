import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutGrid, Settings, BookOpen, Sliders, Type, Sparkles,
  Shield, Users, ToggleRight, Clock, FlaskConical, BarChart2, CheckSquare, QrCode
} from "lucide-react";
import GerarLinkModal from "./GerarLinkModal";
import { cn } from "@/lib/utils";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from "@/components/ui/tooltip";
import HighContrastToggle from "../HighContrastToggle";

const menuItems = [
  { label: "Dashboard",             href: "/admin",                  icon: LayoutGrid,   tooltip: "Visão geral do dashboard com métricas principais." },
  { label: "Dashboard Executivo",   href: "/admin/executivo",         icon: BarChart2,    tooltip: "KPIs estratégicos e Mapa de Calor." },
  { label: "Tarefas",               href: "/admin/tarefas",           icon: CheckSquare,  tooltip: "Gerenciamento geral das operações em Kanban." },
  { label: "Gerenciar Admins",      href: "/admin/admins",            icon: Shield,       tooltip: "Cadastro, edição e exclusão de administradores." },
  { label: "Cadastrar Temas",       href: "/admin/temas",             icon: BookOpen,     tooltip: "Gerencia temas de festas (criar/editar/excluir)." },
  { label: "Opções Nº Convidados",  href: "/admin/opcoes-convidados", icon: Users,        tooltip: "Definir opções para número de convidados." },
  { label: "Gerenciar Perguntas",   href: "/admin/perguntas",         icon: Settings,     tooltip: "Configurar perguntas do formulário (CRUD/reordenar)." },
  { label: "Configurar Escala",     href: "/admin/escala",            icon: Sliders,      tooltip: "Definir escalas sliders (0-10 / 0-5)." },
  { label: "Tamanho das respostas", href: "/admin/max-chars",         icon: Type,         tooltip: "Controla tamanho máximo de textos." },
  { label: "Configs Gerais",        href: "/admin/configs",           icon: ToggleRight,  tooltip: "Configurações gerais do app (SMTP, textos, alertas)." },
  { label: "Audit Log",             href: "/admin/audit",             icon: Clock,        tooltip: "Registro completo de logs e ações administrativas." },
  { label: "Análises Avançadas",    href: "/admin/analises",          icon: Sparkles,     tooltip: "Gráficos IA: regressão/ANOVA/correlações/wordcloud." },
  { label: "Testes E2E",            href: "/admin/testes",            icon: FlaskConical, tooltip: "Suíte de testes end-to-end completa." },
];

export default function Sidebar() {
  const location = useLocation();
  const [showGerarLink, setShowGerarLink] = useState(false);
  const adminEmail = (() => { try { return JSON.parse(localStorage.getItem("adminData") || "{}").email || ""; } catch { return ""; } })();

  return (
    <TooltipProvider delayDuration={100}>
      <aside className="w-64 bg-card border-r border-border hidden lg:flex flex-col h-screen sticky top-0">
        {/* Logo */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <img
            src="https://media.base44.com/images/public/69d5512a4585ccb7cb7b0fd6/8ae34c042_mlkd.jpg"
            alt="Mulekada"
            className="w-10 h-10 rounded-full object-contain"
          />
          <div>
            <p className="font-heading font-bold text-sm text-foreground">Mulekada</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1" aria-label="Menu administrativo">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.href}
                    aria-label={item.label}
                    onMouseEnter={() => console.log(`Tooltip [${item.label}] ativado`)}
                    onFocus={() => console.log(`Tooltip [${item.label}] ativado`)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-heading font-semibold transition-all w-full",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  sideOffset={8}
                  className="max-w-[220px] text-xs leading-snug z-[9999]"
                >
                  {item.tooltip}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* Gerar Link */}
        <div className="p-4 border-t border-border">
          <button
            onClick={() => setShowGerarLink(true)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-heading font-semibold transition-all w-full text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          >
            <QrCode className="w-4 h-4 shrink-0" />
            Gerar Avaliação
          </button>
        </div>
        <GerarLinkModal open={showGerarLink} onClose={() => setShowGerarLink(false)} adminEmail={adminEmail} />

        {/* Footer */}
        <div className="p-4 border-t border-border text-xs text-muted-foreground space-y-2">
          <HighContrastToggle variant="sidebar" />
          <p className="px-1">Desenvolvido por Leonardo Alves</p>
        </div>
      </aside>
    </TooltipProvider>
  );
}