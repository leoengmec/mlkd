import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Star, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute top-1/4 right-10 w-40 h-40 rounded-full bg-accent/15 blur-2xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center text-center max-w-md w-full"
      >
        {/* Logo oficial */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
          className="mb-6"
        >
          <motion.img
            src="https://media.base44.com/images/public/69d5512a4585ccb7cb7b0fd6/8ae34c042_mlkd.jpg"
            alt="Mulekada Buffet"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-52 h-52 sm:w-64 sm:h-64 object-contain drop-shadow-2xl rounded-full"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2 mb-6"
        >
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="font-heading text-base text-muted-foreground font-semibold tracking-wide uppercase">
            Buffet Infantil • Desde 2005
          </span>
          <Sparkles className="w-4 h-4 text-accent" />
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-card rounded-2xl p-8 shadow-xl shadow-primary/5 border border-border/50 w-full"
        >
          <div className="flex justify-center gap-2 mb-4">
            <PartyPopper className="w-6 h-6 text-primary" />
            <Star className="w-6 h-6 text-accent fill-accent" />
            <PartyPopper className="w-6 h-6 text-secondary" />
          </div>

          <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
            Sua opinião nos ajuda!
          </h2>
          <p className="text-muted-foreground font-body text-sm mb-8 leading-relaxed">
            Conte como foi a experiência da festa no Mulekada Buffet. 
            Leva menos de 2 minutos! 🎉
          </p>

          <Link to="/formulario">
            <Button
              size="lg"
              className="w-full font-heading font-bold text-lg py-6 rounded-xl bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              🌟 Iniciar Avaliação
            </Button>
          </Link>
        </motion.div>

        {/* Instagram */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-4"
        >
          <a
            href="https://www.instagram.com/mulekadabuffet/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-heading font-semibold text-sm"
          >
            <span className="text-lg">📸</span>
            @mulekadabuffet
          </a>
        </motion.div>

        {/* Footer icons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center gap-4 mt-6 text-3xl"
        >
          <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            🎪
          </motion.span>
          <motion.span animate={{ y: [0, -5, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}>
            🎂
          </motion.span>
          <motion.span animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}>
            🎁
          </motion.span>
          <motion.span animate={{ y: [0, -5, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.7 }}>
            🧸
          </motion.span>
        </motion.div>
      </motion.div>
    </div>
  );
}