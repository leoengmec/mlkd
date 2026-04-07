import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Settings, Users, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminHome() {
  const features = [
    {
      icon: BarChart3,
      title: "Análises Avançadas",
      description: "Acompanhe em tempo real gráficos, NPS, promotores e detratores"
    },
    {
      icon: Settings,
      title: "Configurações",
      description: "Customize temas, perguntas, escalas e limites de caracteres"
    },
    {
      icon: Users,
      title: "Gerenciar Admins",
      description: "Controle quem tem acesso ao painel administrativo"
    },
    {
      icon: Lock,
      title: "Auditoria",
      description: "Acompanhe todas as ações realizadas no sistema"
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-card/80 backdrop-blur border-b border-border px-4 py-4 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://media.base44.com/images/public/69d5512a4585ccb7cb7b0fd6/8ae34c042_mlkd.jpg"
                alt="Mulekada"
                className="w-10 h-10 rounded-full object-contain"
              />
              <div>
                <h1 className="font-heading font-bold text-foreground">Mulekada</h1>
                <p className="text-xs text-muted-foreground">Painel Administrativo</p>
              </div>
            </div>
            <Link to="/admin/login">
              <Button className="gap-2">
                Acessar Dashboard <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-16 space-y-20">
          {/* Hero */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <div className="space-y-4">
              <h1 className="font-heading text-5xl md:text-6xl font-bold text-foreground leading-tight">
                Painel Admin <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Mulekada</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Gerencie avaliações, analise feedbacks e configure seu sistema de forma simples e intuitiva.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/admin/login">
                <Button size="lg" className="gap-2 font-heading font-bold text-lg">
                  Entrar no Dashboard <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="font-heading font-bold text-lg">
                Saiba Mais
              </Button>
            </div>
          </motion.section>

          {/* Features Grid */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + idx * 0.1 }}
                  className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.section>

          {/* Stats */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-card rounded-3xl p-8 border border-border/50 shadow-sm"
          >
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-4xl font-bold font-heading text-primary mb-2">∞</p>
                <p className="text-muted-foreground">Avaliações ilimitadas</p>
              </div>
              <div>
                <p className="text-4xl font-bold font-heading text-secondary mb-2">📊</p>
                <p className="text-muted-foreground">Relatórios em tempo real</p>
              </div>
              <div>
                <p className="text-4xl font-bold font-heading text-accent mb-2">🔒</p>
                <p className="text-muted-foreground">Segurança total</p>
              </div>
            </div>
          </motion.section>

          {/* CTA */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl p-12 border border-primary/20 text-center"
          >
            <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
              Pronto para começar?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Faça login no seu painel administrativo e comece a gerenciar suas avaliações agora mesmo.
            </p>
            <Link to="/admin/login">
              <Button size="lg" className="gap-2 font-heading font-bold text-lg">
                Acessar Agora <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border mt-20 py-8 text-center text-sm text-muted-foreground">
          <p>© 2026 Mulekada Buffet. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
}