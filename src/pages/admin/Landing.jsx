import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Users, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "../../components/Footer";

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    const adminData = localStorage.getItem("adminData");
    if (adminData) {
      navigate("/admin/home");
    }
  }, [navigate]);

  const features = [
    {
      icon: BarChart3,
      title: "Dashboard Inteligente",
      description: "Visualize métricas, NPS, avaliações e tendências em tempo real"
    },
    {
      icon: Users,
      title: "Gerenciar Respostas",
      description: "Acesse todas as avaliações dos clientes organizadamente"
    },
    {
      icon: Shield,
      title: "Controle Total",
      description: "Configure temas, perguntas, escalas e notificações"
    },
    {
      icon: Zap,
      title: "IA Integrada",
      description: "Análise automática de feedback com insights acionáveis"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-sm border-b border-border/50 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://media.base44.com/images/public/69d5512a4585ccb7cb7b0fd6/8ae34c042_mlkd.jpg"
              alt="Mulekada"
              className="w-10 h-10 rounded-full object-contain"
            />
            <h1 className="font-heading font-bold text-foreground text-lg">Mulekada Admin</h1>
          </div>
          <Link to="/admin/login">
            <Button size="sm" className="rounded-lg font-heading font-bold">
              Entrar
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            Dashboard de Avaliações
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Monitore a satisfação dos seus clientes, analise feedback e tome decisões baseadas em dados reais
          </p>
          <Link to="/admin/login">
            <Button size="lg" className="rounded-lg font-heading font-bold shadow-lg shadow-primary/25 hover:scale-105 transition-transform">
              <span>Acessar Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border/50 hover:border-primary/50 transition-colors"
              >
                <Icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-heading font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-border/50 rounded-2xl p-8 text-center"
        >
          <h3 className="font-heading text-2xl font-bold text-foreground mb-3">
            Acesso Restrito aos Administradores
          </h3>
          <p className="text-muted-foreground mb-6">
            Para acessar o dashboard, faça login com suas credenciais de administrador
          </p>
          <Link to="/admin/login">
            <Button size="lg" className="rounded-lg font-heading font-bold">
              Fazer Login
            </Button>
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}