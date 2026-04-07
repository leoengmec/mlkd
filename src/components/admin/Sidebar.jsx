import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, Settings, BookOpen, Sliders, Type, Sparkles, Shield, Users, ToggleRight, Clock, Link as LinkIcon, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { label: "Dashboard", href: "/admin", section: null, icon: LayoutGrid },
  { label: "Gerenciar Admins", href: "/admin", section: "admins", icon: Shield },
  { label: "Cadastrar Temas", href: "/admin/temas", section: null, icon: BookOpen },
  { label: "Opções Nº Convidados", href: "/admin/opcoes-convidados", section: null, icon: Users },
  { label: "Gerenciar Perguntas", href: "/admin", section: "perguntas", icon: Settings },
  { label: "Configurar Escala", href: "/admin/escala", section: null, icon: Sliders },
  { label: "Tamanho das respostas", href: "/admin/max-chars", section: null, icon: Type },
  { label: "Configs Gerais", href: "/admin/configs", section: null, icon: ToggleRight },
  { label: "Audit Log", href: "/admin/audit", section: null, icon: Clock },
  { label: "Análises Avançadas", href: "/admin/analises", section: null, icon: Sparkles },
  { label: "Gerar Link/QR", href: "/admin", section: "gerar-link", icon: LinkIcon },
];

export default function Sidebar() {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activePath, setActivePath] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Debug: Log route changes
  useEffect(() => {
    const pathname = location.pathname;
    const params = new URLSearchParams(location.search);
    const section = params.get("section");

    console.log("🔍 [SIDEBAR DEBUG] Route Change:", {
      pathname,
      section,
      search: location.search,
      timestamp: new Date().toLocaleTimeString(),
    });

    // Determine active item
    let active = null;

    if (pathname === "/admin" || pathname === "/admin/") {
      active = section || "dashboard";
      console.log(`✅ Matched /admin root → Active: ${active}`);
    } else {
      const matchedItem = menuItems.find((item) => {
        if (item.section) return false;
        return item.href === pathname;
      });

      if (matchedItem) {
        active = matchedItem.href;
        console.log(`✅ Matched route: ${pathname} → Active: ${matchedItem.label}`);
      } else {
        active = "dashboard";
        console.warn(`⚠️ No route match for: ${pathname} → Fallback: Dashboard`);
      }
    }

    setActivePath(active);
  }, [location.pathname, location.search]);

  // Handle mobile resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      console.log(`📱 [SIDEBAR] Resize detected - Mobile: ${mobile}`);
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMenuActive = (item) => {
    if (item.section) {
      return activePath === item.section;
    }
    if (item.href === "/admin" && activePath === "dashboard") {
      return true;
    }
    return activePath === item.href;
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <div className="fixed top-4 left-4 z-40 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setIsMobileOpen(!isMobileOpen);
            console.log(`📱 [SIDEBAR] Mobile menu toggled: ${!isMobileOpen}`);
          }}
          className="bg-card shadow-md"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen z-35 w-64 bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out",
          isMobileOpen ? "translate-x-0 shadow-xl" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-border flex items-center gap-3 animate-fade-in">
          <img
            src="https://media.base44.com/images/public/69d5512a4585ccb7cb7b0fd6/8ae34c042_mlkd.jpg"
            alt="Mulekada"
            className="w-10 h-10 rounded-full object-contain transition-transform duration-300 hover:scale-110"
          />
          <div>
            <p className="font-heading font-bold text-sm text-foreground">Mulekada</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = isMenuActive(item);

            return (
              <Link
                key={item.label}
                to={item.section ? `/admin?section=${item.section}` : item.href}
                onClick={closeMobileMenu}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-heading font-semibold transition-all duration-300 ease-in-out hover:shadow-md",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md scale-105 origin-left"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:scale-102 origin-left"
                )}
                style={{
                  transitionDelay: isMobileOpen ? `${index * 30}ms` : "0ms",
                }}
                title={item.label}
              >
                <Icon className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <span className="ml-auto text-xs font-bold animate-pulse">●</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border text-xs text-muted-foreground space-y-2">
          <p className="font-semibold">v1.0</p>
          <p className="text-[11px] leading-tight">
            © 2026 Mulekada Buffet
          </p>
          <p className="text-[11px] leading-tight font-medium text-primary/70">
            Desenvolvido por Leonardo Alves
          </p>
        </div>
      </aside>
    </>
  );
}