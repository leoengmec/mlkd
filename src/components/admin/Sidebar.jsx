import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, Settings, BookOpen, Sliders, Type, Sparkles, Shield, Users, ToggleRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
{ label: "Dashboard", href: "/admin", icon: LayoutGrid },
{ label: "Gerenciar Admins", href: "/admin/admins", icon: Shield },
{ label: "Cadastrar Temas", href: "/admin/temas", icon: BookOpen },
{ label: "Opções Nº Convidados", href: "/admin/opcoes-convidados", icon: Users },
{ label: "Gerenciar Perguntas", href: "/admin/perguntas", icon: Settings },
{ label: "Configurar Escala", href: "/admin/escala", icon: Sliders },
{ label: "Tamanho das respostas", href: "/admin/max-chars", icon: Type },
{ label: "Configs Gerais", href: "/admin/configs", icon: ToggleRight },
{ label: "Audit Log", href: "/admin/audit", icon: Clock },
{ label: "Análises Avançadas", href: "/admin/analises", icon: Sparkles }];


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
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-heading font-semibold transition-all",
                isActive ?
                "bg-primary text-primary-foreground shadow-md" :
                "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}>
              
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>);

        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border text-xs text-muted-foreground">
        
        <p>Dashboard Admin Mulekada</p>
      </div>
    </aside>);

}