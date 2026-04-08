import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, Settings, BookOpen, Sliders, Type, Sparkles, Shield, Users, ToggleRight, Clock, FlaskConical, BarChart2, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
{ label: "Dashboard",              href: "/admin",                  icon: LayoutGrid,   tooltip: "Visão geral do dashboard com métricas principais." },
{ label: "Dashboard Executivo",    href: "/admin/executivo",         icon: BarChart2,    tooltip: "KPIs estratégicos e Mapa de Calor." },
{ label: "Tarefas",                href: "/admin/tarefas",           icon: CheckSquare,  tooltip: "Gerenciamento geral das operações em Kanban." },
{ label: "Gerenciar Admins",       href: "/admin/admins",            icon: Shield,       tooltip: "Cadastro, edição e exclusão de administradores." },
{ label: "Cadastrar Temas",        href: "/admin/temas",             icon: BookOpen,     tooltip: "Gerencia temas de festas (criar/editar/excluir)." },
{ label: "Opções Nº Convidados",   href: "/admin/opcoes-convidados", icon: Users,        tooltip: "Definir opções para número de convidados." },
{ label: "Gerenciar Perguntas",    href: "/admin/perguntas",         icon: Settings,     tooltip: "Configurar perguntas do formulário (CRUD/reordenar)." },
{ label: "Configurar Escala",      href: "/admin/escala",            icon: Sliders,      tooltip: "Definir escalas sliders (0-10/0-5)." },
{ label: "Tamanho das respostas",  href: "/admin/max-chars",         icon: Type,         tooltip: "Controla tamanho máximo de textos." },
{ label: "Configs Gerais",         href: "/admin/configs",           icon: ToggleRight,  tooltip: "Configurações gerais do app (SMTP, textos, alertas)." },
{ label: "Audit Log",              href: "/admin/audit",             icon: Clock,        tooltip: "Registro completo de logs e ações administrativas." },
{ label: "Análises Avançadas",     href: "/admin/analises",          icon: Sparkles,     tooltip: "Gráficos IA: regressão/ANOVA/correlações/wordcloud." },
{ label: "Testes E2E",             href: "/admin/testes",            icon: FlaskConical, tooltip: "Suíte de testes end-to-end completa." },
];


export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-card border-r border-border hidden lg:flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <img
          src="https://media.base44.com/images/public/69d5512a4585ccb7cb7b0fd6/8ae34c042_mlkd.jpg"
          alt="Mulekada"
          className="w-10 h-10 rounded-full object-contain" />
        <div>
          <p className="font-heading font-bold text-sm text-foreground">Mulekada</p>
          <p className="text-xs text-muted-foreground">Admin</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <div key={item.href} className="relative group">
              <Link
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-heading font-semibold transition-all",
                  isActive ?
                  "bg-primary text-primary-foreground shadow-md" :
                  "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}>
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
              {/* Tooltip */}
              <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50
                opacity-0 group-hover:opacity-100
                transition-opacity duration-200 ease-in-out">
                <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl whitespace-nowrap max-w-[220px] leading-snug">
                  {item.tooltip}
                  {/* Arrow */}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border text-xs text-muted-foreground">
        <p>Desenvolvido por Leonardo Alves</p>
      </div>
    </aside>
  );
}